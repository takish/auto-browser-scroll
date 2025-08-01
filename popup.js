const scrollUpButton = document.getElementById('scrollUp');
const scrollDownButton = document.getElementById('scrollDown');
const stopButton = document.getElementById('stop');
const speedSlider = document.getElementById('speed');
const statusDiv = document.getElementById('status');

let currentDirection = 0; // -1 for up, 1 for down, 0 for stopped

function manageScrolling(direction, speed) {
  // Update the global direction
  currentDirection = direction;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) {
      statusDiv.textContent = 'Error: No active tab found.';
      return;
    }
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: (dir, spd) => {
          // Clear any existing interval
          if (window.scrollInterval) {
            clearInterval(window.scrollInterval);
          }
          // Start a new interval if direction is not 0
          if (dir !== 0) {
            window.scrollInterval = setInterval(() => {
              window.scrollBy(0, dir);
            }, 100 / spd);
          }
        },
        args: [direction, speed],
      },
      () => {
        if (chrome.runtime.lastError) {
          statusDiv.textContent = 'Could not run on this page. Try a different website.';
        } else {
          statusDiv.textContent = '';
        }
      }
    );
  });
}

scrollUpButton.addEventListener('mouseover', () => manageScrolling(-1, speedSlider.value));
scrollDownButton.addEventListener('mouseover', () => manageScrolling(1, speedSlider.value));
stopButton.addEventListener('click', () => manageScrolling(0, speedSlider.value));

speedSlider.addEventListener('input', (event) => {
  // Apply the new speed immediately if scrolling is active
  if (currentDirection !== 0) {
    manageScrolling(currentDirection, event.target.value);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => true, // A simple function to check injectability
        },
        (results) => {
          if (chrome.runtime.lastError || !results || !results[0].result) {
            statusDiv.textContent = 'Cannot run on this page.';
            scrollUpButton.disabled = true;
            scrollDownButton.disabled = true;
            stopButton.disabled = true;
            speedSlider.disabled = true;
          }
        }
      );
    }
  });
});
