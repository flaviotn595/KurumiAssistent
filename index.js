const { fetchJson, range } = require('./lib/function')
const { Telegraf } = require('telegraf')
const help = require('./lib/help')
const tele = require('./lib/tele')
const clc = require('chalk');
const os = require('os')
const fs = require('fs')

const {
    apikey,
    bot_token,
    owner,
    ownerLink,
    version,
    prefix
} = JSON.parse(fs.readFileSync(`./config.json`))

const bot = new Telegraf(bot_token)

bot.command('start', async(lol) => {
    user = await tele.getUser(lol)
    await help.start(lol, user.full_name)
})

bot.command('help', async(lol) => {
    user = await tele.getUser(lol)
    await help.help(lol, user.full_name)
})

bot.on("callback_query", async(lol) => {
    callback_data = lol.callbackQuery.data
    user = await tele.getUser(lol)
    switch (callback_data) {
        case 'islami':
            await help.islami(lol)
            break
        case 'downloader':
            await help.download(lol)
            break
        case 'help':
        default:
            await help.help(lol, user.full_name)
            break
    }
})

bot.on("message", async(lol) => {
    try {
        const body = lol.message.text || lol.message.caption || ""

        comm = body.trim().split(" ").shift().toLowerCase()
        if (prefix != "" && body.startsWith(prefix)) {
            comm = body.slice(1).trim().split(" ").shift().toLowerCase()
        }
        const command = comm
        const args = await tele.getArgs(lol)

        const reply = async(text) => {
            for (var x of range(0, text.length, 4096)) {
                await lol.replyWithMarkdown(text.substr(x, 4096))
            }
        }

        const isGroup = lol.chat.type.includes("group")

        const quotedMessage = lol.message.reply_to_message || {}
        const isQuotedImage = quotedMessage.photo ? true : false
        const isQuotedVideo = quotedMessage.video ? true : false
        const isQuotedSticker = quotedMessage.sticker ? true : false
        const isQuotedDocument = quotedMessage.document ? true : false
        const isQuotedAnimation = quotedMessage.animation ? true : false

        switch (command) {
            case 'help':
                user = await tele.getUser(lol)
                await help.help(lol, user.full_name)
                break
                // Downloader //
            case 'ytplay':
                if (args.length == 0) return reply(`Exemplo: ${prefix + command} kurumi`)
                query = args.join(" ")
                result = await fetchJson(`http://api.lolhuman.xyz/api/ytplay2?apikey=${apikey}&query=${query}`)
                result = result.result
                await lol.replyWithPhoto(result.thumbnail, { caption: result.title })
                break
            case 'ytsearch':
                if (args.length == 0) return reply(`Exemplo: ${prefix + command} Arcade`)
                try {
                    query = args.join(" ")
                    result = await fetchJson(`http://api.lolhuman.xyz/api/ytsearch?apikey=${apikey}&query=${query}`)
                    hasil = result.result.slice(0, 3)
                    hasil.forEach(async(res) => {
                        caption = `\`❖ Título     :\` *${res.title}*\n`
                        caption += `\`❖ Link      :\`* https://www.youtube.com/watch?v=${res.videoId} *\n`
                        caption += `\`❖ Publicados :\` *${res.published}*\n`
                        caption += `\`❖ Visualizações    :\` *${res.views}*\n`
                        await lol.replyWithPhoto({ url: res.thumbnail }, { caption: caption, parse_mode: "Markdown" })
                    })
                } catch (e) {
                    console.log(e)
                    help.messageError(lol)
                }
                break
            case 'ytmp3':
                if (args.length == 0) return reply(`Exemplo: ${prefix + command} https://www.youtube.com/watch?v=qZIQAk-BUEc`)
                ini_link = args[0]
                result = await fetchJson(`http://api.lolhuman.xyz/api/ytaudio?apikey=${apikey}&url=${ini_link}`)
                result = result.result
                caption = `\`❖ Título    :\` *${result.title}*\n`
                caption += `\`❖ Carregador :\` *${result.uploader}*\n`
                caption += `\`❖ Duração :\` *${result.duration}*\n`
                caption += `\`❖ Visualizar     :\` *${result.view}*\n`
                caption += `\`❖ Lim     :\` *${result.like}*\n`
                caption += `\`❖ Deslike  :\` *${result.dislike}*\n`
                caption += `\`❖ Tamanho     :\` *${result.link[3].size}*`
                await lol.replyWithPhoto({ url: result.thumbnail }, { caption: caption, parse_mode: "Markdown" })
                if (Number(result.link[3].size.split(` MB`)[0]) >= 50.00) return reply(`Desculpe, o bot não pode enviar mais de 50 MB!`)
                await lol.replyWithAudio({ url: result.link[3].link }, { title: result.title, thumb: result.thumbnail })
                break
            case 'ytmp4':
                if (args.length == 0) return reply(`Exemplo: ${prefix + command} https://www.youtube.com/watch?v=qZIQAk-BUEc`)
                ini_link = args[0]
                result = await fetchJson(`http://api.lolhuman.xyz/api/ytvideo?apikey=${apikey}&url=${ini_link}`)
                result = result.result
                caption = `\`❖ Título    :\` *${result.title}*\n`
                caption += `\`❖ Uploader :\` *${result.uploader}*\n`
                caption += `\`❖ Duração :\` *${result.duration}*\n`
                caption += `\`❖ Visualizar     :\` *${result.view}*\n`
                caption += `\`❖ Like     :\` *${result.like}*\n`
                caption += `\`❖ Deslike  :\` *${result.dislike}*\n`
                caption += `\`❖ Tamanho     :\` *${result.link[3].size}*`
                await lol.replyWithPhoto({ url: result.thumbnail }, { caption: caption, parse_mode: "Markdown" })
                if (Number(result.link[0].size.split(` MB`)[0]) >= 50.00) return reply(`Desculpe, o bot não pode enviar mais de 50 MB!`)
                await lol.replyWithVideo({ url: result.link[0].link }, { thumb: result.thumbnail })
                break
            case 'tiktoknowm':
                if (args.length == 0) return reply(`Exemplo: ${prefix + command} https://vt.tiktok.com/ZSwWCk5o/`)
                url = args[0]
                url = `http://api.lolhuman.xyz/api/tiktok?apikey=${apikey}&url=${url}`
                result = await fetchJson(url)
                await lol.replyWithVideo({ url: result.result.link })
                break
            case 'tiktokmusic':
                if (args.length == 0) return reply(`Exemplo: ${prefix + command} https://vt.tiktok.com/ZSwWCk5o/`)
                ini_link = args[0]
                await lol.replyWithAudio({ url: `http://api.lolhuman.xyz/api/tiktokmusic?apikey=${apikey}&url=${ini_link}` })
                break
            case 'spotify':
                if (args.length == 0) return reply(`Exemplo: ${prefix + command} https://open.spotify.com/track/0ZEYRVISCaqz5yamWZWzaA`)
                url = args[0]
                result = await fetchJson(`http://api.lolhuman.xyz/api/spotify?apikey=${apikey}&url=${url}`)
                result = result.result
                caption = `\`❖ Título      :\` *${result.title}*\n`
                caption += `\`❖ Artistas    :\` *${result.artists}*\n`
                caption += `\`❖ Duração   :\` *${result.duration}*\n`
                caption += `\`❖ Popularidade :\` *${result.popularity}*`
                await lol.replyWithPhoto({ url: result.thumbnail }, { caption: caption, parse_mode: "Markdown" })
                await lol.replyWithAudio({ url: result.link }, { title: result.title, thumb: result.thumbnail })
                break
            case 'spotifysearch':
                if (args.length == 0) return reply(`Exemplo: ${prefix + command} Arcade`)
                try {
                    query = args.join(" ")
                    result = await fetchJson(`http://api.lolhuman.xyz/api/spotifysearch?apikey=${apikey}&query=${query}`)
                    hasil = result.result.slice(0, 3)
                    hasil.forEach(async(res) => {
                        caption = `\`❖ Título     :\` *${res.title}*\n`
                        caption += `\`❖ Artistas   :\` *${res.artists}*\n`
                        caption += `\`❖ Link      :\`* ${res.link} *\n`
                        caption += `\`❖ Duração  :\` *${res.duration}*\n`
                        await reply(caption)
                    })
                } catch (e) {
                    help.messageError(lol)
                }
                break
            case 'jooxplay':
                if (args.length == 0) return reply(`Exemplo: ${prefix + command} Arcade`)
                query = args.join(" ")
                result = await fetchJson(`http://api.lolhuman.xyz/api/jooxplay?apikey=${apikey}&query=${query}`)
                result = result.result
                caption = `\`❖ Título    :\` *${result.info.song}*\n`
                caption += `\`❖ Artistas  :\` *${result.info.singer}*\n`
                caption += `\`❖ Duração :\` *${result.info.duration}*\n`
                caption += `\`❖ Álbum    :\` *${result.info.album}*\n`
                caption += `\`❖ Uploaded :\` *${result.info.date}*\n`
                caption += `\`❖ Letra da música    :\`\n ${result.lirik}`
                await lol.replyWithPhoto({ url: result.image }, { caption: caption, parse_mode: "Markdown" })
                await lol.replyWithAudio({ url: result.link[0].link }, { title: result.info.song, thumb: result.image })
                break
            case 'pinterest':
                if (args.length == 0) return reply(`Exemplo: ${prefix + command} wallpaper`)
                query = args.join(" ")
                url = await fetchJson(`http://api.lolhuman.xyz/api/pinterest?apikey=${apikey}&query=${query}`)
                url = url.result
                await lol.replyWithPhoto({ url: url })
                break
            default:
        }
    } catch (e) {
        console.log(e)
    }
})


bot.launch()
bot.telegram.getMe().then((getme) => {
    itsPrefix = (prefix != "") ? prefix : "No Prefix"
    console.log(clc.greenBright(' ===================================================='))
    console.log(clc.greenBright(" │ + Proprietário    : " + owner))
    console.log(clc.greenBright(" │ + Nome do Bot : " + getme.first_name))
    console.log(clc.greenBright(" │ + Versão  : " + version))
    console.log(clc.greenBright(" │ + Hospedeiro     : " + os.hostname()))
    console.log(clc.greenBright(" │ + Plataformas : " + os.platform()))
    console.log(clc.greenBright(" │ + Testemunho     : " + os.cpus()[0].model))
    console.log(clc.greenBright(" │ + Velocidade    : " + os.cpus()[0].speed + " MHz"))
    console.log(clc.greenBright(" │ + Testemunho     : " + os.cpus().length))
    console.log(clc.greenBright(` │ + RAM      : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB / ${Math.round(os.totalmem / 1024 / 1024)} MB`))
    console.log(clc.greenBright(" │ + Prefix   : " + itsPrefix))
    console.log(clc.greenBright(' ===================================================='))
})
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))