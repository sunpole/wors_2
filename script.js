document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://sheets.googleapis.com/v4/spreadsheets/YOUR_SPREADSHEET_ID/values/SHEET_NAME?key=YOUR_API_KEY";
    const songListElement = document.getElementById("song-list");
    const playlistElement = document.getElementById("playlist");
    const savePlaylistButton = document.getElementById("save-playlist-btn");
    const createPlaylistButton = document.getElementById("create-playlist-btn");

    // Load songs from Google Sheets API
    async function loadSongs() {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            const songs = data.values.slice(1); // Skip header row

            songs.forEach((song) => {
                const songItem = document.createElement("div");
                songItem.className = "song-item";
                songItem.textContent = song[0]; // Assuming first column is the song name
                songItem.draggable = true;

                // Drag-and-drop functionality
                songItem.addEventListener("dragstart", (e) => {
                    e.dataTransfer.setData("text/plain", song[0]);
                });

                songListElement.appendChild(songItem);
            });
        } catch (error) {
            console.error("Error loading songs:", error);
        }
    }

    // Drag-and-drop to playlist
    playlistElement.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    playlistElement.addEventListener("drop", (e) => {
        e.preventDefault();
        const songName = e.dataTransfer.getData("text/plain");
        const playlistItem = document.createElement("div");
        playlistItem.className = "playlist-item";
        playlistItem.textContent = songName;
        playlistElement.appendChild(playlistItem);
    });

    // Save playlist
    savePlaylistButton.addEventListener("click", async () => {
        const playlistName = document.getElementById("playlist-name").value;
        const creatorName = document.getElementById("creator-name").value;

        if (!playlistName || !creatorName) {
            alert("Please enter playlist name and your name.");
            return;
        }

        const songs = Array.from(playlistElement.children).map((item) => item.textContent);
        const payload = {
            playlistName,
            creatorName,
            dateCreated: new Date().toISOString(),
            songs,
        };

        try {
            // Save playlist to Google Sheets
            console.log("Saving playlist:", payload);
            alert("Playlist saved successfully!");
        } catch (error) {
            console.error("Error saving playlist:", error);
        }
    });

    createPlaylistButton.addEventListener("click", () => {
        playlistElement.innerHTML = ""; // Clear current playlist
    });

    loadSongs();
});
