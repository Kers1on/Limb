export const getCustomHttpForMxc = (baseUrl: string, mxc: string, accessToken: string) => {
  if (!baseUrl || !mxc || !accessToken) {
    return "";
  }

  const [serverName, mediaId] = mxc.slice(6).split("/");

  if (!serverName || !mediaId) {
    return "";
  }

  return `${baseUrl}/_matrix/client/v1/media/download/${serverName}/${mediaId}?access_token=${accessToken}`;
};