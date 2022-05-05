/**
 * Have in mind while targeting the DOM, it has to be done via HTML tags such as button, div, etc, or `data-tag`,
 * we can't use `class` because Patreon can easily change the classes' name each time they bundle their code
 */

chrome.runtime.onMessage.addListener(function (msg, _sender, sendResponse) {
  const postId = `patreon-post- ${window.location.pathname.split('/posts/')[1]}`

  /**
   * We need to keep "const button = $(buttonQuery)" inside the loadComents scope to prevent the click
   * be targeted on a removed button. This query will at least facilitate to prevent of duplication.
   */
  const buttonQuery = 'button[data-tag="loadMoreCommentsCta"]'
  const comments = $(buttonQuery).closest('div')

  comments.attr('data-export-patreon-comments', 'true')

  const commentsId = $(`div[data-export-patreon-comments="true"]`)
  const hasLoadedAllComments = () => !commentsId.find($(buttonQuery)).length
  let readyToExport = false

  const loadComents = () => {
    const clickingLoop = setInterval(() => {
      if (hasLoadedAllComments() && readyToExport) {
        exportComments()
      }
      if (hasLoadedAllComments()) {
        return commentsId.trigger('stopLoadMoreCommentsCta')
      }

      $(buttonQuery).click()
    }, 1500)

    commentsId.on('stopLoadMoreCommentsCta', () => {
      clearInterval(clickingLoop)
    })
  }

  const exportComments = () => {
    const postTitle = $('[data-tag="post-title"]').text().toUpperCase()
    const postPublishedDate = $('[data-tag="post-published-at"]').text()
    const commentRow = $('[data-tag="comment-row"]')
    const numberOfPostLikes = $('[data-tag="post-details"]')
      .find('a[tabindex]')
      .text()
    const url = window.location.href
    let fileName = '',
      title = '',
      exportComments = '',
      numberOfComments = ''

    commentRow.each(function () {
      const userName = $(this).find('[data-tag="commenter-name"]')
      const userComment = $(this).find('[data-tag="comment-body"]')
      /**
       * Sub-comments would need to use more "parent()" to get to this same location, unfortunately,
       * neither of these elements has any different `data-tag` to facilitate this targeting.
       */
      const isMainComment = $(this)
        .parent()
        .parent()
        .parent()
        .parent()
        .prev()
        .attr('data-tag', 'post-details').length

      let userCommentTime = ''
      let numberOfLikes = ''

      // Count number of comments
      numberOfComments++

      // If the row is an answer to another comment
      if (!isMainComment) {
        exportComments += '\u27A5 Reply'
        exportComments += '\n'
      }

      userName.each(function () {
        exportComments += $(this).text().replace(/,/g, '')
        exportComments += '\n'
      })

      userComment.each(function () {
        userCommentTime = $(this)
          .closest('[data-tag="comment-row"]')
          .find('time')
          .text()
        // If there are likes
        let likeButton = $(this)
          .closest('[data-tag="comment-row"]')
          .find('[data-tag="like-button"')
        if (likeButton.children().length > 1) {
          let likes = ' Likes'
          if (likeButton.text() === '1') {
            likes = ' Like'
          }
          numberOfLikes = '. ' + likeButton.text() + likes + '.'
        }

        exportComments += $(this)
          .text()
          .replace(/,/g, '')
          .replace(/\r?\n|\r/g, ' ')
        exportComments += '\n'
        exportComments += userCommentTime + numberOfLikes
        exportComments += '\n\n'
      })

      return fileName, numberOfComments
    })

    title = `${postTitle} \n${url} \n\nPublished: ${postPublishedDate} \n${numberOfPostLikes} \n${numberOfComments} comments \n Exported: ${GetTodayDate()}`
    fileName = `${postId}-${numberOfComments}-comments-${GetTodayDate()}`
    exportComments = `${title}, \n\n${exportComments}`

    // Save File
    console.save(exportComments, fileName + '.csv')
  }

  // Show Comments
  if (msg.message == 'show-comments') {
    loadComents()
  } else if (msg.message == 'export-comments') {
    readyToExport = true

    if (hasLoadedAllComments()) return exportComments()

    alert(
      'The file will be generated as soon as all comments have been loaded.'
    )
    loadComents()
  }

  sendResponse()
})

//== UTILITIES
// Function Get Today Date
function GetTodayDate() {
  var tdate = new Date()
  var dd = tdate.getDate()
  var MM = tdate.getMonth()
  var yyyy = tdate.getFullYear()
  var currentDate = dd + '-' + (MM + 1) + '-' + yyyy

  return currentDate
}

// Function Console Save
;(function (console) {
  console.save = function (data, filename) {
    if (!data) {
      console.error('Console.save: No data')
      return
    }

    if (!filename) filename = 'console.json'

    if (typeof data === 'object') {
      data = JSON.stringify(data, undefined, 4)
    }

    var blob = new Blob([data], { type: 'text/json' }),
      e = document.createEvent('MouseEvents'),
      a = document.createElement('a')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
    e.initMouseEvent(
      'click',
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    )
    a.dispatchEvent(e)
  }
})(console)
