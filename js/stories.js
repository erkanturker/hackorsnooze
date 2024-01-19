"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

async function getAndShowOwnStories() {
  storyList = await StoryList.getStories();
  putOwnStoriesOnPage(currentUser);
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, ownStory = false) {
  const favorites = currentUser.favorites;
  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}">
      <span class="icons">
      ${ownStory ? `<i class="fas fa-trash-alt itrash"></i>` : ""}
          <i class="${
            favorites.some((fav) => fav.storyId === story.storyId)
              ? "fas fa-star istar"
              : "far fa-star istar"
          }"></i>
      </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

function putFavoritedStoriesOnPage() {
  $favoritedStoriesList.empty();
  currentUser.favorites.forEach((favStory) => {
    const $favStory = generateStoryMarkup(favStory);
    $favoritedStoriesList.append($favStory);
  });

  $favoritedStoriesList.show();
}

function putOwnStoriesOnPage() {
  $ownStoriesList.empty();
  currentUser.ownStories.forEach((ownStory) => {
    const $ownStory = generateStoryMarkup(ownStory, true);
    $ownStoriesList.append($ownStory);
  });

  $ownStoriesList.show();
}

async function postStory(evt) {
  evt.preventDefault();
  const author = $("#author").val();
  const title = $("#title").val();
  const url = $("#url").val();

  await storyList.addStory(currentUser, { author, title, url });

  await clearStoryFormAndHide();
}

async function clearStoryFormAndHide() {
  $("#author").val("");
  $("#title").val("");
  $("#url").val("");

  $storyForm.hide();
  await getAndShowStoriesOnStart();
}

$storyForm.on("submit", postStory);

$storiesContainer.on("click", ".icons>.itrash", async function () {
  const $trashIcon = $(this);
  const id = $trashIcon.closest("li").attr("id");
  await storyList.removeStory(currentUser, id);
  //await getAndShowOwnStories();
  putOwnStoriesOnPage();
});
