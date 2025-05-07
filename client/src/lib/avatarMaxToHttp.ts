export const getCustomHttpForMxc = (baseUrl: string, mxc: string, accessToken: string) => {
  if (!baseUrl || !mxc || !accessToken) {
    return "";
  }

  const [serverName, mediaId] = mxc.slice(6).split("/");

  if (!serverName || !mediaId) {
    return "";
  }

  // return `${baseUrl}/_matrix/client/v1/media/download/${serverName}/${mediaId}?access_token=${accessToken}`;
  return `${baseUrl}/_matrix/client/v1/media/thumbnail/${serverName}/${mediaId}?width=320&height=180&method=scale&access_token=${accessToken}`;
};