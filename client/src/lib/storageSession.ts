// TODO: Change to another storage method

export function saveSession(accessToken: string, userId: string, baseUrl: string, deviceId: string) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("userId", userId);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("deviceId", deviceId);
};

export function getSession() {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    const baseUrl = localStorage.getItem("baseUrl");
    const deviceId = localStorage.getItem("deviceId");

    return {
        accessToken,
        userId,
        baseUrl,
        deviceId,
    };
};

export function saveSelectedRoomId(roomId: string) {
    localStorage.setItem("selectedRoomId", roomId);
}

export function getSelectedRoomId() {
    const selectedRoomId = localStorage.getItem("selectedRoomId");
    return selectedRoomId;
}

export function clearSelectedRoomId() {
    localStorage.removeItem("selectedRoomId");
}

export function clearSession() {
    localStorage.clear();
};