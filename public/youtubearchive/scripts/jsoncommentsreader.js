// setup
const videoInfo = document.getElementById("videoInfo");
const commentsBox = document.getElementById("commentsBox");
const commentCount = document.getElementById("commentCount");
const selectedFile = document.getElementById("selectedFile");
const filterButtons = document.getElementById("filterButtons");
const sortingButton = document.getElementById("sortingButton");
const toggleRepliesButton = document.getElementById("toggleReplies");
let highestvideo, highestaudio
let sortedByTop = false
let showingReplies = true
let totalComments;

function openFile() {
    document.getElementById('getFile').click()
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        let fr = new FileReader();
        fr.onload = x => resolve(fr.result);
        fr.readAsText(file);
    })
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

async function getDislikes(id) {
    const response = await fetch("https://returnyoutubedislikeapi.com/votes?videoId=" + id);
    let dislikeresponse = await response.json();
    document.getElementById("dislikeCounter").innerHTML = dislikeresponse.dislikes
}

function readFile(input) {
    fetch(input)
        .then((response) => response.ok ? response.text() : console.log("Playlist file doesn't exist!"))
        .then((data) => read(data)); // javascript fetching protocol
}

async function read(data) {
    data = JSON.parse(data);

    videoInfo.innerHTML = "Reading comments...";
    commentsBox.innerHTML = "";

    let dislikes = "Unknown...";
    videoInfo.innerHTML = `
            <img style="border-radius: 10px; max-width: 100%;" src="${data.thumbnail}"><br/>--------------------------------------------------<br/>
            <a target="_blank" href="https://youtube.com/watch?v=${data.id}">${data.title}</a><br/>
            Views: ${data.view_count} | Duration: ${data.duration_string}
            <br/>Uploaded by: <a target="_blank" href="${data.uploader_url}">${data.channel} (${data.uploader_id})</a> | ${data.channel_follower_count} subscribers
            <br/>Uploaded: ${data.upload_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}
            <br/>Likes: ${data.like_count} | Dislikes: <span id="dislikeCounter">Loading...</span> | Comments: ${data.comment_count}
            <br/>Categories: ${data.categories}
            <br/>File size: ${formatBytes(data.filesize_approx)} (${data.format_note})
            <br/>--------------------------------------------------<br/>
            ${makeLinks(data.description.replace(/\n/g, '<br>'))}
            <br/>--------------------------------------------------<br/>
            `;
    await getDislikes(data.id);
    totalComments = data.comments.length;
    renderComments(data);
}

function makeLinks(content) {
    var re = /((?:href|src)=")?(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    content = content.replace(re, function (match, attr) {
        if (typeof attr != 'undefined') {
            return match;
        }
        return '<a target="_blank" href="' + match + '">' + match + '</a>';
    });
    return content
}

async function renderComments(data) {
    let startTime = performance.now()

    commentsBox.innerHTML = ""
    const fragment = document.createDocumentFragment();
    showingReplies = true

    for (let index = 0; index < data.comments.length; index++) {
        const element = data.comments[index];
        const commentDiv = document.createElement('div');
        commentDiv.id = element.id;

        if (element.text) { // rarely a comment won't contain text
            if (element.parent === "root") {
                commentDiv.classList.add('SNSParent');
                commentDiv.innerHTML = `
                        <div class="SNSPost">
                            <div class="SNSArea"><a target="_blank" href="${element.author_url}"><img class="SNSIcon" src="${element.author_thumbnail}"></a>
                                <div class="SNSUserInfo">
                                    <span class="SNSUsername">
                                        <a target="_blank" href="${element.author_url}">${element.author}</a>
                                    </span>
                                    <br><span id="SNSDate">${element._time_text}</span> | 
                                    <a target="_blank" href="https://youtube.com/watch?v=${data.id}&lc=${element.id}">Open</a>
                                </div>
                                <div class="SNSExtraInfo">
                                    ${element.like_count ? element.like_count : 0} likes
                                    <br><span id="${element.id}replycount">0</span> replies
                                    <br>${element.is_pinned ? "📌Pinned<br>" : ""}
                                    ${element.is_favorited ? "💖Liked" : ""}
                                </div>
                            </div>
                            <div class="SNSPostText">
                                ${element.text.trim().replace(/\n/g, '<br>')}
                            </div>
                        </div>
                        <div class="Replies" id="${element.id}reply"></div>
                        `;
                fragment.appendChild(commentDiv);
            } else {
                // const parentCommentCount = fragment.getElementById(`${element.parent}replycount`)
                // parentCommentCount.innerHTML = parseInt(parentCommentCount.innerHTML) + 1
                commentDiv.classList.add('SNSPost');
                commentDiv.style.marginLeft = '75px';
                commentDiv.innerHTML = `
                        <div class="SNSArea"><a target="_blank" href="${element.author_url}"><img class="SNSIcon" src="${element.author_thumbnail}"></a>
                            <div class="SNSUserInfo">
                                <span class="SNSUsername">
                                    <a target="_blank" href="${element.author_url}">${element.author}</a>
                                </span>
                                <br><span id="SNSDate">${element._time_text}</span> | 
                                <a target="_blank" href="https://youtube.com/watch?v=${data.id}&lc=${element.id}">Open</a>
                            </div>
                            <div class="SNSExtraInfo">
                                ${element.like_count ? element.like_count : 0} likes
                                <br>${element.is_favorited ? "💖Liked" : ""}
                            </div>
                        </div>
                        <div class="SNSPostText">
                            ${element.text.trim().replace(/\n/g, '<br>')}
                        </div>
                        `;
                fragment.getElementById(`${element.parent}reply`).appendChild(commentDiv);
            }
        }

        if (element.is_pinned) commentDiv.dataset.info = "Pinned "
        if (element.is_favorited) {
            if (commentDiv.dataset.info) {
                commentDiv.dataset.info += "Liked "
            } else {
                commentDiv.dataset.info = "Liked "
            }
        }
    }

    commentsBox.appendChild(fragment);
    commentCount.innerText = "Comments: " + totalComments;

    data.formats.forEach(element => {
        if (element.url) {
            if (element.resolution == "audio only") {
                highestaudio = element.url
            } else if (element.format = "mp4") {
                highestvideo = element.url
            }
        }
    });

    commentsBox.innerHTML +=
        `<video id="ytVideo" controls>
                        <source src="${highestvideo}">>
                    </video>
                <audio controls id="ytAudio" src="${highestaudio}"></audio>`

    filterButtons.classList.remove("hidden")
    videoInfo.innerHTML = `<hr>Time taken: ${performance.now() - startTime}ms<hr>` + videoInfo.innerHTML
}

function filterComments(filterBy) {
    let visibleCount = 0;
    for (const element of commentsBox.children) {
        const hasFilter = filterBy && element.dataset.info && element.dataset.info.includes(filterBy);
        const isVisible = !filterBy || hasFilter;
        element.classList.toggle("hidden", !isVisible);
        if (isVisible) {
            visibleCount++;
        }
    }
    commentCount.innerText = `Comments: ${totalComments} ${filterBy ? `(Showing: ${visibleCount})` : ""}`;
}

function switchSorting() {
    if (sortedByTop) {
        sortedByTop = false;
        sortingButton.textContent = "Sort by top";
        renderComments();
        return;
    }
    filterComments();
    sortedByTop = true;
    sortingButton.textContent = "Sort by new";
    const divList = Array.from(commentsBox.querySelectorAll('.SNSParent'))
        .map((div) => {
            const likes = parseInt(div.querySelector('.SNSExtraInfo').innerText.trim());
            const text = div.querySelector('.SNSPostText').innerText.trim();
            return { likes, text, div };
        })
        .sort((a, b) => b.likes - a.likes);
    commentsBox.innerHTML = "";
    divList.forEach((entry) => {
        commentsBox.appendChild(entry.div);
    });
}

function toggleReplies() {
    for (const element of commentsBox.children) {
        const reply = element.children[1];
        if (reply) {
            reply.classList.toggle("hidden", showingReplies);
        }
    }
    showingReplies = !showingReplies;
    toggleRepliesButton.innerHTML = showingReplies ? "Hide replies" : "Show replies";
}