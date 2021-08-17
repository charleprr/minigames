let logsChannel = null;
let lastContent = null;
let lastMessage = null;
let repeatCount = 1;

export function setLogsChannel(channel) {
    logsChannel = channel;
}

export async function send(content) {
    if (content == lastContent) {
        repeatCount++;
        return lastMessage.edit(`\`${content}\` (x${repeatCount})`);
    } else if (repeatCount > 1) {
        repeatCount = 1;
    }
    lastContent = content;
    lastMessage = await logsChannel?.send(`\`${content}\``);
}