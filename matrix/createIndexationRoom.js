async function createIndexationRoom() {
  const accessToken = "syt_a2Vyc2lvbg_eTvQogbQazqtPwhhEtnk_0pGl3s";

  try {
    const response = await fetch(`http://localhost:8008/_matrix/client/v3/createRoom?access_token=${accessToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        visibility: "public",
        name: "Limb",
        room_alias_name: "limb",
        preset: "public_chat",
        topic: "Limb's public room",
        creation_content: {},
        initial_state: [
          {
            type: "m.room.history_visibility",
            state_key: "",
            content: { history_visibility: "world_readable" }
          },
          {
            type: "m.room.guest_access",
            state_key: "",
            content: { guest_access: "can_join" }
          }
        ]
      })
    });

    const result = await response.json();
    console.log("Результат створення кімнати:", result);
  } catch (error) {
    console.error("Помилка при створенні кімнати:", error);
  }
}

createIndexationRoom();