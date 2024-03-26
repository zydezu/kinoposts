// setup
const videoInfo = document.getElementById("videoInfo");
const commentsBox = document.getElementById("commentsBox");
const commentCount = document.getElementById("commentCount");
const selectedFile = document.getElementById("selectedFile");
const filterButtons = document.getElementById("filterButtons");
const sortingButton = document.getElementById("sortingButton");
const toggleRepliesButton = document.getElementById("toggleReplies");
let highestvideo, highestaudio;
let sortedByTop = false;
let showingReplies = true;
let totalComments;

const dropZone = document.querySelector("body");

window.addEventListener("dragover", (e) => {
	e.preventDefault();
});

dropZone.addEventListener("drop", (e) => {
	e.preventDefault();
	const fileInput = document.getElementById("getFile");
	read(e.dataTransfer.files);
});

function openFile() {
	document.getElementById("getFile").click();
}

function readFile(file) {
	return new Promise((resolve, reject) => {
		let fr = new FileReader();
		fr.onload = (x) => resolve(fr.result);
		try {
			fr.readAsText(file);
		} catch (error) {
			console.log("Invalid file type!");
		}
	});
}

function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return (
		parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
	);
}

async function getDislikes() {
	const response = await fetch(
		"https://returnyoutubedislikeapi.com/votes?videoId=" + data.id
	);
	let dislikeresponse = await response.json();
	document.getElementById("dislikeCounter").innerHTML =
		dislikeresponse.dislikes;
}

async function read(input) {
	fileType = "";
	if (input.files) {
		data = await readFile(input.files[0]);
		selectedFile.innerHTML = input.files[0].name;
		fileType = input.files[0].type;
	} else {
		data = await readFile(input[0]);
		selectedFile.innerHTML = input[0].name;
		fileType = input[0].type;
	}
	if (fileType != "application/json") return;

	data = JSON.parse(data);
	console.log(data)

	videoInfo.innerHTML = "Reading comments...";
	commentsBox.innerHTML = "";

	let tagsList = ""
	if (data.tags) {
		data.tags.forEach(element => {
			tagsList += "<code>"
			tagsList += element
			tagsList += "</code> "
		});
	}

	videoInfo.innerHTML = `
		<img style="border-radius: 10px" src="${data.thumbnail}"><br/>--------------------------------------------------<br/>
		<a target="_blank" href="https://youtube.com/watch?v=${data.id}">${data.title}</a><br/>
		Views: ${data.view_count} | Duration: ${data.duration_string}
		<br/>Uploaded by: <a target="_blank" href="${data.uploader_url}">${data.channel} (${data.uploader_id})</a> | ${data.channel_follower_count} subscribers
		<br/>Uploaded: ${data.upload_date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")}
		<br/>Likes: ${data.like_count} | Dislikes: <span id="dislikeCounter">Loading...</span> | Comments: ${data.comment_count}
		<br/>Categories: ${data.categories}
		<br/>File size: ${formatBytes(data.filesize_approx)} (${data.format_note})
		<br/>--------------------------------------------------<br/>
		${makeLinks(data.description.replace(/\n/g, "<br>"))}
		<br/>--------------------------------------------------<br/>
		Tags: ${tagsList}
		<br/>--------------------------------------------------<br/>
		`;
	await getDislikes();
	totalComments = data.comments.length;
	renderComments();
}

function makeLinks(content) {
	var re =
		/((?:href|src)=")?(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
	content = content.replace(re, function (match, attr) {
		if (typeof attr != "undefined") {
			return match;
		}
		return '<a target="_blank" href="' + match + '">' + match + "</a>";
	});
	return content;
}

async function renderComments() {
	let startTime = performance.now();

	commentsBox.innerHTML = "";
	const fragment = document.createDocumentFragment();
	showingReplies = true;

	for (let index = 0; index < data.comments.length; index++) {
		const element = data.comments[index];
		const commentDiv = document.createElement("div");
		commentDiv.id = element.id;

		if (element.text) {
			// rarely a comment won't contain text
			if (element.parent === "root") {
				commentDiv.classList.add("SNSParent");
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
						<span class="SNSLikeCount">${element.like_count ? element.like_count : 0}</span> like${element.like_count != 1 ? `s` : ``} | 
							<span id="${element.id}replycount">0 replies</span> |
							<a target="_blank" href="https://youtube.com/watch?v=${data.id}&lc=${element.id}">Open</a>
						</div>
					</div>
				</div>
				<div class="SNSReplies" id="${element.id}reply"></div>
				`;
			fragment.appendChild(commentDiv);
			} else {
				// const parentCommentCount = fragment.getElementById(`${element.parent}replycount`)
				// parentCommentCount.innerHTML = parseInt(parentCommentCount.innerHTML) + 1
				commentDiv.classList.add("SNSPost");
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
						<span class="SNSLikeCount">${element.like_count ? element.like_count : 0}</span> like${element.like_count != 1 ? `s` : ``} | 
						<a target="_blank" href="https://youtube.com/watch?v=${data.id}&lc=${element.id}">Open</a>
					</div>
				</div>
				`;
				try {
					const replyID =  fragment.getElementById(`${element.parent}reply`)
					const replyCount =  fragment.getElementById(`${element.parent}replycount`)
					let newReplyCount = parseInt(replyCount.innerHTML.split(" ")[0]) + 1
					replyCount.innerText = `${newReplyCount} repl${newReplyCount == 1 ? `y` : `ies`}`
					fragment.getElementById(`${element.parent}reply`).appendChild(commentDiv);
				} catch (error) {
					// reply comment not in fragment - use global
					document.getElementById(`${element.parent}reply`).appendChild(commentDiv);
				}
			}
		}

		if (element.is_pinned) commentDiv.dataset.info = "Pinned ";
		if (element.is_favorited) {
			if (commentDiv.dataset.info) {
				commentDiv.dataset.info += "Liked ";
			} else {
				commentDiv.dataset.info = "Liked ";
			}
		}
	}

	commentsBox.appendChild(fragment);
	commentCount.innerText = "Comments: " + totalComments;

	data.formats.forEach((element) => {
		if (element.url) {
			if (element.resolution == "audio only") {
				highestaudio = element.url;
			} else if ((element.format = "mp4")) {
				highestvideo = element.url;
			}
		}
	});

	commentsBox.innerHTML += `<video id="ytVideo" controls>
                        <source src="${highestvideo}">>
                    </video>
                <audio controls id="ytAudio" src="${highestaudio}"></audio>`;

	filterButtons.classList.remove("hidden");
	videoInfo.innerHTML =
		`<hr>Time taken: ${performance.now() - startTime}ms<hr>` +
		videoInfo.innerHTML;
}

function filterComments(filterBy) {
	let visibleCount = 0;
	for (const element of commentsBox.children) {
		const hasFilter =
			filterBy &&
			element.dataset.info &&
			element.dataset.info.includes(filterBy);
		const isVisible = !filterBy || hasFilter;
		element.classList.toggle("hidden", !isVisible);
		if (isVisible) {
			visibleCount++;
		}
	}
	commentCount.innerText = `Comments: ${totalComments} ${filterBy ? `(Showing: ${visibleCount})` : ""
		}`;
}

function switchSorting() {
    if (sortedByTop) {
        sortedByTop = false;
        sortingButton.textContent = "Sort by top";
        renderComments();
        return;
    }
    console.log("Loaded all comments")
    filterComments();
    sortedByTop = true;
    sortingButton.textContent = "Sort by new";
    const divList = Array.from(commentsBox.querySelectorAll('.SNSParent'))
        .map((div) => {
            const likes = parseInt(div.querySelector('.SNSLikeCount').innerText.trim());
            const text = div.querySelector('.SNSPostText').innerText.trim();
            return { likes, text, div };
        })
        .sort((a, b) => b.likes - a.likes);
    commentsBox.innerHTML = ""
    divList.forEach((entry) => {
        commentsBox.appendChild(entry.div);
    });
};

function toggleReplies() {
    for (const element of commentsBox.children) {
        const reply = element.children[1];
        if (reply) {
            reply.classList.toggle("hidden", showingReplies);
        }
    }
    showingReplies = !showingReplies;
    toggleRepliesButton.innerHTML = showingReplies ? "Hide replies" : "Show replies";
};
