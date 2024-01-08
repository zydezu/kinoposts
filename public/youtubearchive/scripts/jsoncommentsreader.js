// setup
const videoInfo = document.getElementById("videoInfo");
const selectedFile = document.getElementById("selectedFile");
const filterButtons = document.getElementById("filterButtons");
const sortingButton = document.getElementById("sortingButton");
const toggleRepliesButton = document.getElementById("toggleReplies");
const switchCommentsLayoutButton = document.getElementById("switchCommentsLayoutButton");
const scrollingPlace = document.getElementById("sideBarScroll")
let sortedByTop;
let showingReplies;
resetButtonStates();
let oldCommentPosition = false;
var commentsBox;
var commentCount;
let startingIndex;
var commentsToLoadInitially = 20;
var commentsToLoadAtOnce = 5;
let allCommentsLoaded = false;
let currentFilter = "";
getCommentsBox();

function getCommentsBox() {
    commentsBox = document.getElementById(oldCommentPosition ? "classicCommentsBox" : "commentsBox");
    commentCount = document.getElementById(oldCommentPosition ? "classicCommentCount" : "commentCount");
}

function resetButtonStates() {
    sortedByTop = false;
    showingReplies = true;
    sortingButton.textContent = "Sort by top";
    toggleRepliesButton.innerHTML = showingReplies ? "Hide replies" : "Show replies";
}

function switchCommentsLayout() {
    let temp = [commentsBox.innerHTML, commentCount.innerHTML];
    commentsBox.innerHTML = "";
    commentCount.innerHTML = "";
    oldCommentPosition = 1 - oldCommentPosition;
    getCommentsBox();
    commentsBox.innerHTML = temp[0];
    commentCount.innerHTML = temp[1];
    renderCommentCount();
}

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
    commentsBox.innerHTML = ""
    fetch(input)
        .then((response) => response.ok ? response.text() : console.log("Video info file doesn't exist!"))
        .then((returndata) => read(returndata)); // javascript fetching protocol
}

async function read(returndata) {
    data = JSON.parse(returndata);
    resetButtonStates();

    console.log("Loading comments...")

    videoInfo.innerHTML = "Loading information...";
    commentCount.innerHTML = `${oldCommentPosition ? `<br/>` : ``} Loading comments... 
    <button class="switchCommentsLayout" onclick="switchCommentsLayout()">Switch comments layout</button>`;
    commentsBox.innerHTML = "";

    let dislikes = "Unknown...";
    videoInfo.innerHTML = `
            <hr>
            <a target="_blank" href="https://youtube.com/watch?v=${data.id}">${data.fulltitle}</a><br/>
            Views: ${data.view_count} | Duration: ${data.duration_string}
            <br/>Uploaded by: <a target="_blank" href="${data.uploader_url}">${data.channel} (${data.uploader_id})</a> | ${data.channel_follower_count} subscribers
            <br/>Uploaded: ${data.upload_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}
            <br/>Likes: ${data.like_count} | Dislikes: <span id="dislikeCounter">Loading...</span> | Comments: ${data.comment_count}
            <br/>Categories: ${data.categories}
            <br/>Tags: ${data.tags}
            <hr>
            ${makeLinks(data.description.replace(/\n/g, '<br>'))}
            <hr>
            `;
    await getDislikes(data.id);
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

async function renderComments() {
    commentsBox.innerHTML = ''
    const fragment = document.createDocumentFragment();
    showingReplies = true

    startingIndex = 0
    allCommentsLoaded = true;
    for (let index = startingIndex; index < data.comments.length; index++) {
        if (index > startingIndex + commentsToLoadInitially) {
            allCommentsLoaded = false;
            startingIndex = index;
            break;
        }
        renderNextComment(fragment, index)
    }

    commentsBox.appendChild(fragment);
    renderCommentCount();

    filterButtons.classList.remove("hidden")
}

function renderCommentCount() {
    commentCount.innerHTML = `${oldCommentPosition ? `<br/>` : ``}  Comments: ${data.comment_count}
    <button class="switchCommentsLayout" onclick="switchCommentsLayout()">Switch comments layout</button>`;
}

async function loadMoreComments() {
    console.log("Loading more comments.")
    const fragment = document.createDocumentFragment();

    allCommentsLoaded = true;
    for (let index = startingIndex; index < data.comments.length; index++) {
        if (index > startingIndex + commentsToLoadAtOnce) {
            allCommentsLoaded = false;
            startingIndex = index;
            break;
        }
        renderNextComment(fragment, index)
    }

    commentsBox.appendChild(fragment);
    filterComments(currentFilter);
}

scrollingPlace.addEventListener("scroll", () => {
    sideBoxCheckNewComments();
});

function sideBoxCheckNewComments() {
    if (!allCommentsLoaded) {
        if (scrollingPlace.scrollHeight - scrollingPlace.scrollTop === scrollingPlace.clientHeight) {
            loadMoreComments()
        }
    }
}

window.onscroll = function (ev) {
    if ((oldCommentPosition || window.innerWidth < 950) && !allCommentsLoaded) {
        if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
            loadMoreComments()
        }
    }
};


function loadAllComments() {
    const fragment = document.createDocumentFragment();
    for (let index = startingIndex; index < data.comments.length; index++) {
        renderNextComment(fragment, index)
    }
    commentsBox.appendChild(fragment);
    filterComments(currentFilter);
    allCommentsLoaded = true;
}

function renderNextComment(fragment, index) {
    const element = data.comments[index];
    const commentDiv = document.createElement('div');
    commentDiv.id = element.id;

    if (element.text) { // rarely a comment won't contain text
        if (element.parent === "root") {
            commentDiv.classList.add('SNSParent');
            commentDiv.innerHTML = `
                    <div class="SNSPost">
                        <div class="SNSArea"><a target="_blank" href="${element.author_url}"><img class="SNSIcon" onload="this.style.opacity=1" src="${element.author_thumbnail}"></a>
                            <div class="SNSUserInfo">
                                <span class="SNSUsername">
                                    <a target="_blank" href="${element.author_url}">${element.author}</a>
                                </span>
                                <br><span id="SNSDate">${element._time_text}</span>
                            </div>
                            <div class="SNSAlignRight SNSExtraInfo">
                                ${element.is_pinned ? "📌Pinned<br>" : ""}
                                ${element.is_favorited ? "💖Liked" : ""}
                            </div>
                        </div>
                        <div class="SNSPostText">
                            ${element.text.trim().replace(/\n/g, '<br>')}<br/>
                            <div class="SNSExtraInfo">
                                ${element.like_count ? element.like_count : 0} likes | 
                                <span id="${element.id}replycount">0</span> replies |
                                <a target="_blank" href="https://youtube.com/watch?v=${data.id}&lc=${element.id}">Open</a>
                            </div>
                        </div>
                    </div>
                    <div class="SNSReplies" id="${element.id}reply"></div>
                    `;
            fragment.appendChild(commentDiv);
        } else {
            commentDiv.classList.add('SNSPost');
            commentDiv.innerHTML = `
                    <div class="SNSArea"><a target="_blank" href="${element.author_url}"><img class="SNSIcon" onload="this.style.opacity=1" src="${element.author_thumbnail}"></a>
                        <div class="SNSUserInfo">
                            <span class="SNSUsername">
                                <a target="_blank" href="${element.author_url}">${element.author}</a>
                            </span>
                            <br><span id="SNSDate">${element._time_text}</span>
                        </div>
                        <div class="SNSAlignRight SNSExtraInfo">
                            ${element.is_favorited ? "💖Liked" : ""}
                        </div>
                    </div>
                    <div class="SNSPostText">
                        ${element.text.trim().replace(/\n/g, '<br>')}
                        <div class="SNSExtraInfo">
                            ${element.like_count ? element.like_count : 0} likes | 
                            <span id="${element.id}replycount">0</span> replies |
                            <a target="_blank" href="https://youtube.com/watch?v=${data.id}&lc=${element.id}">Open</a>
                        </div>
                    </div>
                    `;
            try {
                fragment.getElementById(`${element.parent}reply`).appendChild(commentDiv)
            } catch (error) {
                // reply comment not in fragment - use global
                document.getElementById(`${element.parent}reply`).appendChild(commentDiv);
            }
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

function filterComments(filterBy) {
    currentFilter = filterBy
    let visibleCount = 0;
    for (const element of commentsBox.children) {
        const hasFilter = filterBy && element.dataset.info && element.dataset.info.includes(filterBy);
        const isVisible = !filterBy || hasFilter;
        element.classList.toggle("hidden", !isVisible);
        if (isVisible) {
            visibleCount++;
        }
    }
    if (filterBy) sideBoxCheckNewComments();
    commentCount.innerHTML = `Comments: ${data.comment_count} ${filterBy ? `(Showing: ${visibleCount})` : ""}
    <button class="switchCommentsLayout" onclick="switchCommentsLayout()">Switch comments layout</button>`;
}

function switchSorting() {
    if (sortedByTop) {
        sortedByTop = false;
        sortingButton.textContent = "Sort by top";
        renderComments();
        return;
    }
    loadAllComments();
    console.log("Loaded all comments")
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
    commentsBox.innerHTML = ""
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

function blurClickCloseSettings() {
    console.log("check")
}

const settingsBox = document.getElementById("settingsBox");
const BGBlur = document.getElementById("BGBlur");
let showingSettings = false;
function viewSettings() {
    if (showingSettings) {
        settingsBox.classList.add("hideSettings");
        BGBlur.classList.add("hidden");
    } else {
        settingsBox.classList.remove("hidden");
        settingsBox.classList.remove("hideSettings");

        BGBlur.classList.remove("hidden");

        BGBlur.addEventListener("click", viewSettings);
    }
    showingSettings = 1 - showingSettings;
    return showingSettings;
};