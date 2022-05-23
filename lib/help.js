const fs = require('fs')
const config = JSON.parse(fs.readFileSync(`./config.json`))

exports.start = async(lol, name) => {
    text = `Olá ${name}! Sou um bot multifuncional construído com ❤️ por  [meu mestre](${config.ownerLink}).`
    await lol.replyWithMarkdown(text, { disable_web_page_preview: true })
}

exports.help = async(lol, name) => {
    text = `Olá ${name}! Aqui estão os comandos disponíveis que você pode usar :`
    options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Download Menu', callback_data: 'downloader' }
                ]
            ]
        }
    }
    try {
        await lol.editMessageText(text, options)
    } catch {
        await lol.reply(text, options)
    }
}

exports.download = async(lol) => {
    prefix = config.prefix
    text = `Downloader Menu :

${prefix}ytplay nome
${prefix}ytsearch nome
${prefix}ytmp3 link
${prefix}ytmp4 link
${prefix}tiktoknowm link
${prefix}tiktokmusic link
${prefix}spotify link
${prefix}spotifysearch nome
${prefix}jooxplay nome
${prefix}pinterest nome
${prefix}pixiv nome
`
    await lol.editMessageText(text, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Volta', callback_data: 'help' }
                ]
            ]
        }
    })
}


exports.messageError = async(lol) => {
    await lol.reply(`Erro! Por favor, informe ao [${config.owner}](${config.ownerLink}) sobre isso`, { parse_mode: "Markdown", disable_web_page_preview: true })
}