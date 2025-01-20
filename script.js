document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = 'AIzaSyBI2EVbr1wYje4ewkmwVCg46KtaC2vZrL8';
    const SPREADSHEET_ID = '1CU2LvY8R2CuwMeOmYG9Qj1_ME8bSeOmu2EJ43ylcaw8';
    const SHEET_SONGS = 'Песни';
    const SHEET_LISTS = 'Списки';

    const statusMessage = document.getElementById("status-message");
    const songListElement = document.getElementById("song-list");
    const playlistElement = document.getElementById("playlist");
    const savePlaylistButton = document.getElementById("save-playlist-btn");
    const createPlaylistButton = document.getElementById("create-playlist-btn");

    // Функция для обновления статуса
    function updateStatus(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.style.color = isError ? "red" : "green";
    }

    // Функция для создания URL API
    const getSheetURL = (sheetName) =>
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}?key=${API_KEY}`;

    const appendSheetURL = (sheetName) =>
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;

    // Загрузка песен
    async function loadSongs() {
        try {
            updateStatus("Connecting to Google Sheets...");
            const response = await fetch(getSheetURL(SHEET_SONGS));

            if (!response.ok) {
                throw new Error(
                    response.status === 403
                        ? "Access denied. Check API key or permissions."
                        : `Error ${response.status}: ${response.statusText}`
                );
            }

            const data = await response.json();
            if (!data.values || data.values.length < 2) {
                throw new Error("No data found in the sheet or incorrect sheet format.");
            }

            const songs = data.values.slice(1); // Пропускаем заголовок
            songListElement.innerHTML = ""; // Очищаем перед загрузкой

            songs.forEach((song) => {
                const songItem = document.createElement("div");
                songItem.className = "song-item";
                songItem.textContent = song[0]; // Имя песни в первой колонке
                songItem.draggable = true;

                songItem.addEventListener("dragstart", (e) => {
                    e.dataTransfer.setData("text/plain", song[0]);
                });

                songListElement.appendChild(songItem);
            });

            updateStatus("Songs loaded successfully!");
        } catch (error) {
            console.error("Error loading songs:", error);
            updateStatus(error.message, true);
        }
    }

    // Drag-and-drop для плейлиста
    playlistElement.addEventListener("dragover", (e) => e.preventDefault());

    playlistElement.addEventListener("drop", (e) => {
        e.preventDefault();
        const songName = e.dataTransfer.getData("text/plain");
        const playlistItem = document.createElement("div");
        playlistItem.className = "playlist-item";
        playlistItem.textContent = songName;
        playlistElement.appendChild(playlistItem);
    });

    // Сохранение плейлиста
    async function savePlaylist() {
        const playlistName = document.getElementById("playlist-name").value.trim();
        const creatorName = document.getElementById("creator-name").value.trim();

        if (!playlistName || !creatorName) {
            alert("Введите имя плейлиста и ваше имя.");
            return;
        }

        const songs = Array.from(playlistElement.children).map((item) => item.textContent);
        if (songs.length === 0) {
            alert("Добавьте песни в плейлист.");
            return;
        }

        const payload = {
            values: [[playlistName, creatorName, new Date().toLocaleString(), songs.join(", ")]],
        };

        try {
            const response = await fetch(appendSheetURL(SHEET_LISTS), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert("Плейлист сохранен успешно!");
                playlistElement.innerHTML = ""; // Очистка текущего плейлиста
            } else {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            console.error("Ошибка сохранения плейлиста:", error);
            alert("Не удалось сохранить плейлист. Проверьте консоль для деталей.");
        }
    }

    // Очистка текущего плейлиста
    createPlaylistButton.addEventListener("click", () => {
        playlistElement.innerHTML = "";
    });

    savePlaylistButton.addEventListener("click", savePlaylist);

    // Загрузка песен при загрузке страницы
    loadSongs();
});
