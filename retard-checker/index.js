let checkButton = document.getElementById("checkUser");
let idInput = document.getElementById("userId");
let userStatus = document.getElementById("userStatus");
let checkerStatus = document.getElementById("checkerStatus");

const checkIds = {
    jazzman: "591899182793621527",
    orenso : "796886353534124074"
}

let bannedServers = {};

let status = {
    jazzman: false,
    orenso: false
};

const refreshBannedServers = async () =>
    bannedServers = await fetch("https://raw.githubusercontent.com/Im-Beast/its-Quizizzd/main/info/servers.json", { method: "GET" })
                        .then((response) => response.json())
                        .then((json) => json.banned || {})
                        .catch((_error) => {});

//aaaaa public token1#!@#!
//yes totally worth acc 100% (its not even registered kekw)
const getGuilds = async (userId) =>
    await fetch(`https://discord.com/api/v8/users/${userId}/profile`, {
        headers: {
            Authorization: "ODA0MDM2MDAzNDQyMDY1NDYw.YBGfAA.jLGkGD1-kC9Jtud8vecVVvTnsvM",
            "X-Super-Properties": "eyJvcyI6IkxpbnV4IiwiYnJvd3NlciI6IkZpcmVmb3giLCJkZXZpY2UiOiIiLCJzeXN0ZW1fbG9jYWxlIjoiZW4tVVMiLCJicm93c2VyX3VzZXJfYWdlbnQiOiJNb3ppbGxhLzUuMCAoWDExOyBMaW51eCB4ODZfNjQ7IHJ2Ojg0LjApIEdlY2tvLzIwMTAwMTAxIEZpcmVmb3gvODQuMCIsImJyb3dzZXJfdmVyc2lvbiI6Ijg0LjAiLCJvc192ZXJzaW9uIjoiIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjc1MjM3LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ=="
        },
        referrer: "https://discord.com/channels/803982924449185813/803982925552943123",
        method: "GET",
    })
    .then((response) => response.json())
    .then((json) => json.mutual_guilds ? json.mutual_guilds.map((obj) => obj.id) : [])
    .catch((_error) => []);

const isRetarded = async (userId) => {
    let guilds = await getGuilds(userId);
    let bannedIds = await Object.getOwnPropertyNames(bannedServers);
    return guilds.filter((id) => bannedIds.includes(id));
}

const refreshCheckStatus = async () => {
    status.orenso   = !!(await isRetarded(checkIds.orenso)).length;
    status.jazzman  = !!(await isRetarded(checkIds.jazzman)).length;

    checkerStatus.innerHTML = `Orenso: ${status.orenso ? "dziaua" : "nie dziaua"}<br>J4zzman: ${status.jazzman ? "dziaua" : "nie dziaua"}`;
};

refreshBannedServers().then(refreshCheckStatus);

checkButton.onclick = async () => {
    let retard = await isRetarded(idInput.value);
    if (!!retard.length) {
        userStatus.textContent = "jest kurwą"
        retard.forEach((server) => {
            userStatus.innerHTML += `<br> * ${bannedServers[server].name}`;
        })
    } else {
        userStatus.textContent = "nie jest kurwą";
    }
}
