chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

    const postId = `patreon-post- ${window.location.pathname.split('/posts/')[1]}`;
    const button = $('button[data-tag="loadMoreCommentsCta"]');
    const comments = button.closest('.sc-fzoLsD');
    
    comments.attr('id', 'comments');
    const commentsId = $('#comments');

    let readyToExport = false;
    
    const loadComents = () => {
        const clickingLoop = setInterval(() => {
            if (commentsId.find('button[data-tag="loadMoreCommentsCta"]').length) {
                commentsId.find('button[data-tag="loadMoreCommentsCta"]').each(function () {
                    $(this).click();
                });
            } else {
                if (readyToExport) {
                    exportComments();
                }
                commentsId.trigger( 'stopLoadMoreCommentsCta' );
            }
        }, 1500);
       
        commentsId.on('stopLoadMoreCommentsCta', function(){
            clearInterval(clickingLoop);
        });
    };

    const exportComments = () => {
        // Collect Information To Export
        const postTitle = $('[data-tag="post-title"]').text().toUpperCase();
        const postPublishedDate = $('[data-tag="post-published-at"]').text();
        const commentRow = $('[data-tag="comment-row"]');
        const numberOfPostLikes = $('[data-tag="post-details"]').find('a[tabindex]').text();
        const url = window.location.href;
        let fileName = "",
            title = "",
            exportComments = "",
            numberOfComments = "";    

        commentRow.each(function () {
            const userName = $(this).find('[data-tag="commenter-name"]');
            const userComment = $(this).find('[data-tag="comment-body"]');
            let userCommentTime = "";
            let numberOfLikes = "";
            

            // Count number of comments
            numberOfComments ++;

            // If the row is an answer to another comment
            if ($(this).parent().parent('.hBdeNJ').length) {
                exportComments += '< Reply';
                exportComments += '\n';
            }
            
            userName.each(function () {
                exportComments += $(this).text().replace(/,/g, '');
                exportComments += '\n';
            });
            
            userComment.each(function () {
                userCommentTime = $(this).closest('[data-tag="comment-row"]').find('time').text();
                // If there are likes
                let likeButton = $(this).closest('[data-tag="comment-row"]').find('[data-tag="like-button"');
                if (likeButton.children().length > 1) {
                    let likes = " Likes";                    
                    if (likeButton.text() === "1") {
                        likes = " Like";
                    }
                    numberOfLikes = '. ' + likeButton.text() + likes + '.';
                }

                exportComments += $(this).text().replace(/,/g, '').replace(/\r?\n|\r/g, ' ');
                exportComments += '\n';
                exportComments += userCommentTime + numberOfLikes;
                exportComments += '\n\n';
            });
            
            return fileName, numberOfComments;
        });       

        title = `${postTitle} \n${url} \n\nPublished: ${postPublishedDate} \n${numberOfPostLikes} \n${numberOfComments} comments \n Exported: ${GetTodayDate()}`;
        fileName = `${postId}-${numberOfComments}-comments-${GetTodayDate()}`;
        exportComments = `${title}, \n\n${exportComments}`;

        // Save File
        console.save(exportComments, fileName + '.csv');
    };

    // Show Comments
    if (msg.message == "show-comments") {
        loadComents();

    } else if (msg.message == "export-comments") {

        readyToExport = true; 

        if (commentsId.find('button[data-tag="loadMoreCommentsCta"]').length) {
            alert('The file will be generated as soon as all comments have been loaded.');   
            loadComents();
        } else {
            exportComments();
        }
    }

    sendResponse();
});


//== UTILITIES
    // Function Get Today Date
    function GetTodayDate() {
        var tdate = new Date();
        var dd = tdate.getDate();
        var MM = tdate.getMonth();
        var yyyy = tdate.getFullYear();
        var currentDate = dd + "-" + (MM + 1) + "-" + yyyy;

        return currentDate;
    }

    // Function Console Save
    (function (console) {

        console.save = function (data, filename) {

            if (!data) {
                console.error('Console.save: No data')
                return;
            }

            if (!filename) filename = 'console.json'

            if (typeof data === "object") {
                data = JSON.stringify(data, undefined, 4)
            }

            var blob = new Blob([data], { type: 'text/json' }),
                e = document.createEvent('MouseEvents'),
                a = document.createElement('a')

            a.download = filename
            a.href = window.URL.createObjectURL(blob)
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
            e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
            a.dispatchEvent(e)
        }
    })(console);