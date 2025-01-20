document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = 'AIzaSyBI2EVbr1wYje4ewkmwVCg46KtaC2vZrL8'; // Ваш API-ключ
    const SPREADSHEET_ID = '1CU2LvY8R2CuwMeOmYG9Qj1_ME8bSeOmu2EJ43ylcaw8'; // ID таблицы
    const SHEET_SONGS = 'Песни'; // Лист с песнями
    const SHEET_LISTS = 'Списки'; // Лист для сохранения плейлистов

    const statusMessage = document.getElementById("status-message");
    const songListElement = document.getElementById("song-list");
    const playlistElement = document.getElementById("playlist");
    const savePlaylistButton = document.getElementById("save-playlist-btn");
    const createPlaylistButton = document.getElementById("create-playlist-btn");

    const getSheetURL = (sheetName) =>
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}?key=${API_KEY}`;

    const appendSheetURL = (sheetName) =>
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;

    // Обновление статуса
    function updateStatus(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.style.color = isError ? "red" : "green";
    }

    // Загрузка списка песен
    async function loadSongs() {
        try {
            updateStatus("Connecting to Google Sheets...");
            const response = await fetch(getSheetURL(SHEET_SONGS));

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            if (!data.values || data.values.length < 2) {
                throw new Error("No data found in the sheet or incorrect sheet format.");
            }

            const songs = data.values.slice(1); // Пропускаем заголовок таблицы
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

            updateStatus("Successfully connected to Google Sheets!");
        } catch (error) {
            console.error("Ошибка загрузки песен:", error);
            updateStatus(error.message, true);
        }
    }

    // Drag-and-drop для плейлиста
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

    // Сохранение плейлиста
    savePlaylistButton.addEventListener("click", async () => {
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
    });

    // Очистка текущего плейлиста
    createPlaylistButton.addEventListener("click", () => {
        playlistElement.innerHTML = "";
    });

    // Загрузка песен при загрузке страницы
    loadSongs();
});
