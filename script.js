document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = 'AIzaSyBI2EVbr1wYje4ewkmwVCg46KtaC2vZrL8';
    const SPREADSHEET_ID = '1CU2LvY8R2CuwMeOmYG9Qj1_ME8bSeOmu2EJ43ylcaw8';
    const SHEET_SONGS = 'Песни';
    const SHEET_LISTS = 'Списки';

    const statusMessage = document.getElementById("status-message");
    const songListElement = document.getElementById("song-list");
    const playlistElement = document.getElementById("playlist");
    const addSongButton = document.getElementById("add-song-btn");
    const savePlaylistButton = document.getElementById("save-playlist-btn");

    const getSheetURL = (sheetName) =>
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}?key=${API_KEY}`;

    const appendSheetURL = (sheetName) =>
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;

    // Функция для обновления статуса
    function updateStatus(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.style.color = isError ? "red" : "green";
    }

    // Добавление новой песни
    addSongButton.addEventListener("click", async () => {
        const newSongName = document.getElementById("new-song-name").value.trim();
        const newSongTempo = document.getElementById("new-song-tempo").value.trim();

        if (!newSongName || !newSongTempo) {
            alert("Введите название и темп песни.");
            return;
        }

        const payload = {
            values: [[newSongName, newSongTempo]],
        };

        try {
            const response = await fetch(appendSheetURL(SHEET_SONGS), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert("Песня добавлена успешно!");
                document.getElementById("new-song-name").value = "";
                document.getElementById("new-song-tempo").value = "";
                loadSongs(); // Перезагрузка списка песен
            } else {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            console.error("Ошибка добавления песни:", error);
            alert("Не удалось добавить песню. Проверьте консоль для деталей.");
        }
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

    // Функция для загрузки песен (из предыдущего кода)
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

    // Загрузка песен при старте
    loadSongs();
});
