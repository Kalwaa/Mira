const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const config = require("./config.json");

// ============================================================
// CLIENT
// ============================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// ============================================================
// COMMANDES
// ============================================================

const commands = [

    // /ping
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Vérifie si Mira fonctionne"),

    // /aide
    new SlashCommandBuilder()
        .setName("aide")
        .setDescription("Affiche toutes les commandes de Mira"),

    // /avatar
    new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Affiche l'avatar d'un utilisateur")
        .addUserOption(option =>
            option
                .setName("utilisateur")
                .setDescription("Utilisateur")
                .setRequired(false)
        ),

    // /userinfo
    new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Affiche les informations d'un utilisateur")
        .addUserOption(option =>
            option
                .setName("utilisateur")
                .setDescription("Utilisateur")
                .setRequired(false)
        ),

    // /serverinfo
    new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("Affiche les informations du serveur"),

    // /membercount
    new SlashCommandBuilder()
        .setName("membercount")
        .setDescription("Affiche le nombre de membres"),

    // /clear
    new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Supprime des messages")
        .addIntegerOption(option =>
            option
                .setName("nombre")
                .setDescription("Nombre de messages")
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageMessages
        ),

    // /timeout
    new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Met un membre en timeout")
        .addUserOption(option =>
            option
                .setName("utilisateur")
                .setDescription("Membre")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("minutes")
                .setDescription("Durée en minutes")
                .setMinValue(1)
                .setMaxValue(40320)
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("raison")
                .setDescription("Raison")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        ),

    // /kick
    new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Expulse un membre")
        .addUserOption(option =>
            option
                .setName("utilisateur")
                .setDescription("Membre")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("raison")
                .setDescription("Raison")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.KickMembers
        ),

    // /ban
    new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Bannit un membre")
        .addUserOption(option =>
            option
                .setName("utilisateur")
                .setDescription("Membre")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("raison")
                .setDescription("Raison")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.BanMembers
        ),

    // /8ball
    new SlashCommandBuilder()
        .setName("8ball")
        .setDescription("Pose une question à la boule magique")
        .addStringOption(option =>
            option
                .setName("question")
                .setDescription("Ta question")
                .setRequired(true)
        ),

    // /roll
    new SlashCommandBuilder()
        .setName("roll")
        .setDescription("Lance un dé")
        .addIntegerOption(option =>
            option
                .setName("faces")
                .setDescription("Nombre de faces")
                .setMinValue(2)
                .setMaxValue(1000)
                .setRequired(false)
        ),

    // /coinflip
    new SlashCommandBuilder()
        .setName("coinflip")
        .setDescription("Lance une pièce"),

    // /poll
    new SlashCommandBuilder()
        .setName("poll")
        .setDescription("Crée un sondage")
        .addStringOption(option =>
            option
                .setName("question")
                .setDescription("Question du sondage")
                .setRequired(true)
        ),

    // /say
    new SlashCommandBuilder()
        .setName("say")
        .setDescription("Fait parler Mira")
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("Message à envoyer")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageMessages
        )
].map(command => command.toJSON());

// ============================================================
// DÉPLOIEMENT DES COMMANDES
// ============================================================

async function deployCommands() {

    const rest = new REST({
        version: "10"
    }).setToken(config.token);

    try {

        console.log("🔄 Déploiement des commandes...");

        await rest.put(
            Routes.applicationCommands(config.clientId),
            {
                body: commands
            }
        );

        console.log(
            `✅ ${commands.length} commandes déployées !`
        );

    } catch (error) {

        console.error(
            "❌ Erreur pendant le déploiement :"
        );

        console.error(error);
    }
}

// ============================================================
// MIRA PRÊT
// ============================================================

client.once("ready", readyClient => {

    console.log("");
    console.log("=================================");
    console.log("       🤖 MIRA EST EN LIGNE");
    console.log("=================================");
    console.log(
        `👤 Compte : ${readyClient.user.tag}`
    );
    console.log(
        `🌐 Serveurs : ${readyClient.guilds.cache.size}`
    );
    console.log(
        `⚡ Commandes : ${commands.length}`
    );
    console.log("=================================");

    readyClient.user.setPresence({
        activities: [
            {
                name: "/aide",
                type: 0
            }
        ],
        status: "online"
    });

});

// ============================================================
// INTERACTIONS
// ============================================================

client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) {
        return;
    }

    try {

        // =====================================================
        // PING
        // =====================================================

        if (interaction.commandName === "ping") {

            const message = await interaction.reply({
                content: "🏓 Calcul...",
                fetchReply: true
            });

            const latency =
                message.createdTimestamp -
                interaction.createdTimestamp;

            await interaction.editReply(
                `🏓 **Pong !**\n💓 Latence : **${latency}ms**`
            );

            return;
        }

        // =====================================================
        // AIDE
        // =====================================================

        if (interaction.commandName === "aide") {

            const embed = new EmbedBuilder()
                .setTitle("🤖 Mira")
                .setDescription(
                    "Bot Discord polyvalent"
                )
                .addFields(
                    {
                        name: "🔧 Utilitaire",
                        value:
                            "`/ping`\n" +
                            "`/aide`\n" +
                            "`/avatar`\n" +
                            "`/userinfo`\n" +
                            "`/serverinfo`\n" +
                            "`/membercount`"
                    },
                    {
                        name: "🎉 Fun",
                        value:
                            "`/8ball`\n" +
                            "`/roll`\n" +
                            "`/coinflip`\n" +
                            "`/poll`"
                    },
                    {
                        name: "🛡️ Modération",
                        value:
                            "`/clear`\n" +
                            "`/timeout`\n" +
                            "`/kick`\n" +
                            "`/ban`\n" +
                            "`/say`"
                    }
                )
                .setFooter({
                    text: "Mira • Bot Discord"
                });

            await interaction.reply({
                embeds: [embed]
            });

            return;
        }

        // =====================================================
        // AVATAR
        // =====================================================

        if (interaction.commandName === "avatar") {

            const user =
                interaction.options.getUser(
                    "utilisateur"
                ) || interaction.user;

            const avatar =
                user.displayAvatarURL({
                    size: 1024,
                    extension: "png"
                });

            const embed = new EmbedBuilder()
                .setTitle(
                    `🖼️ Avatar de ${user.username}`
                )
                .setImage(avatar);

            await interaction.reply({
                embeds: [embed]
            });

            return;
        }

        // =====================================================
        // USERINFO
        // =====================================================

        if (interaction.commandName === "userinfo") {

            const user =
                interaction.options.getUser(
                    "utilisateur"
                ) || interaction.user;

            const member =
                await interaction.guild.members
                    .fetch(user.id)
                    .catch(() => null);

            const embed = new EmbedBuilder()
                .setTitle(`👤 ${user.username}`)
                .setThumbnail(
                    user.displayAvatarURL({
                        size: 512
                    })
                )
                .addFields(
                    {
                        name: "🆔 ID",
                        value: user.id,
                        inline: true
                    },
                    {
                        name: "🤖 Bot",
                        value: user.bot ? "Oui" : "Non",
                        inline: true
                    },
                    {
                        name: "📅 Compte créé",
                        value:
                            `<t:${Math.floor(
                                user.createdTimestamp / 1000
                            )}:D>`
                    }
                );

            if (member && member.joinedTimestamp) {

                embed.addFields({
                    name: "📥 Arrivé sur le serveur",
                    value:
                        `<t:${Math.floor(
                            member.joinedTimestamp / 1000
                        )}:D>`
                });
            }

            await interaction.reply({
                embeds: [embed]
            });

            return;
        }

        // =====================================================
        // SERVERINFO
        // =====================================================

        if (interaction.commandName === "serverinfo") {

            const guild = interaction.guild;

            const embed = new EmbedBuilder()
                .setTitle(`🏠 ${guild.name}`)
                .setThumbnail(
                    guild.iconURL({
                        size: 512
                    })
                )
                .addFields(
                    {
                        name: "👥 Membres",
                        value: `${guild.memberCount}`,
                        inline: true
                    },
                    {
                        name: "💬 Salons",
                        value:
                            `${guild.channels.cache.size}`,
                        inline: true
                    },
                    {
                        name: "🎭 Rôles",
                        value:
                            `${guild.roles.cache.size}`,
                        inline: true
                    },
                    {
                        name: "🆔 ID",
                        value: guild.id
                    },
                    {
                        name: "📅 Créé le",
                        value:
                            `<t:${Math.floor(
                                guild.createdTimestamp / 1000
                            )}:D>`
                    }
                );

            await interaction.reply({
                embeds: [embed]
            });

            return;
        }

        // =====================================================
        // MEMBERCOUNT
        // =====================================================

        if (interaction.commandName === "membercount") {

            await interaction.reply(
                `👥 Ce serveur possède **${interaction.guild.memberCount} membres**.`
            );

            return;
        }

        // =====================================================
        // CLEAR
        // =====================================================

        if (interaction.commandName === "clear") {

            if (
                !interaction.member.permissions.has(
                    PermissionFlagsBits.ManageMessages
                )
            ) {

                await interaction.reply({
                    content:
                        "❌ Tu n'as pas la permission.",
                    ephemeral: true
                });

                return;
            }

            const amount =
                interaction.options.getInteger(
                    "nombre"
                );

            const messages =
                await interaction.channel.bulkDelete(
                    amount,
                    true
                );

            await interaction.reply({
                content:
                    `🧹 **${messages.size} messages supprimés.**`,
                ephemeral: true
            });

            return;
        }

        // =====================================================
        // TIMEOUT
        // =====================================================

        if (interaction.commandName === "timeout") {

            if (
                !interaction.member.permissions.has(
                    PermissionFlagsBits.ModerateMembers
                )
            ) {

                await interaction.reply({
                    content:
                        "❌ Tu n'as pas la permission.",
                    ephemeral: true
                });

                return;
            }

            const user =
                interaction.options.getUser(
                    "utilisateur"
                );

            const minutes =
                interaction.options.getInteger(
                    "minutes"
                );

            const reason =
                interaction.options.getString(
                    "raison"
                ) || "Aucune raison indiquée";

            const member =
                await interaction.guild.members
                    .fetch(user.id)
                    .catch(() => null);

            if (!member) {

                await interaction.reply({
                    content:
                        "❌ Membre introuvable.",
                    ephemeral: true
                });

                return;
            }

            if (!member.moderatable) {

                await interaction.reply({
                    content:
                        "❌ Je ne peux pas mettre ce membre en timeout.",
                    ephemeral: true
                });

                return;
            }

            await member.timeout(
                minutes * 60 * 1000,
                reason
            );

            await interaction.reply(
                `🔇 **${user.tag}** a été timeout pendant **${minutes} minutes**.\n📝 ${reason}`
            );

            return;
        }

        // =====================================================
        // KICK
        // =====================================================

        if (interaction.commandName === "kick") {

            if (
                !interaction.member.permissions.has(
                    PermissionFlagsBits.KickMembers
                )
            ) {

                await interaction.reply({
                    content:
                        "❌ Tu n'as pas la permission.",
                    ephemeral: true
                });

                return;
            }

            const user =
                interaction.options.getUser(
                    "utilisateur"
                );

            const reason =
                interaction.options.getString(
                    "raison"
                ) || "Aucune raison indiquée";

            const member =
                await interaction.guild.members
                    .fetch(user.id)
                    .catch(() => null);

            if (!member || !member.kickable) {

                await interaction.reply({
                    content:
                        "❌ Je ne peux pas expulser ce membre.",
                    ephemeral: true
                });

                return;
            }

            await member.kick(reason);

            await interaction.reply(
                `👢 **${user.tag}** a été expulsé.\n📝 ${reason}`
            );

            return;
        }

        // =====================================================
        // BAN
        // =====================================================

        if (interaction.commandName === "ban") {

            if (
                !interaction.member.permissions.has(
                    PermissionFlagsBits.BanMembers
                )
            ) {

                await interaction.reply({
                    content:
                        "❌ Tu n'as pas la permission.",
                    ephemeral: true
                });

                return;
            }

            const user =
                interaction.options.getUser(
                    "utilisateur"
                );

            const reason =
                interaction.options.getString(
                    "raison"
                ) || "Aucune raison indiquée";

            const member =
                await interaction.guild.members
                    .fetch(user.id)
                    .catch(() => null);

            if (member && !member.bannable) {

                await interaction.reply({
                    content:
                        "❌ Je ne peux pas bannir ce membre.",
                    ephemeral: true
                });

                return;
            }

            await interaction.guild.members.ban(
                user.id,
                {
                    reason: reason
                }
            );

            await interaction.reply(
                `🔨 **${user.tag}** a été banni.\n📝 ${reason}`
            );

            return;
        }

        // =====================================================
        // 8BALL
        // =====================================================

        if (interaction.commandName === "8ball") {

            const question =
                interaction.options.getString(
                    "question"
                );

            const answers = [
                "🟢 Oui.",
                "🟢 Absolument.",
                "🟢 Probablement.",
                "🟡 Peut-être.",
                "🟡 Difficile à dire.",
                "🔴 Non.",
                "🔴 Absolument pas.",
                "🔴 Je ne pense pas.",
                "🤔 Demande-moi plus tard."
            ];

            const answer =
                answers[
                    Math.floor(
                        Math.random() *
                        answers.length
                    )
                ];

            await interaction.reply(
                `🎱 **Question :** ${question}\n\n**Réponse :** ${answer}`
            );

            return;
        }

        // =====================================================
        // ROLL
        // =====================================================

        if (interaction.commandName === "roll") {

            const faces =
                interaction.options.getInteger(
                    "faces"
                ) || 6;

            const result =
                Math.floor(
                    Math.random() * faces
                ) + 1;

            await interaction.reply(
                `🎲 Tu as lancé un dé à **${faces} faces**.\n\n🎯 Résultat : **${result}**`
            );

            return;
        }

        // =====================================================
        // COINFLIP
        // =====================================================

        if (interaction.commandName === "coinflip") {

            const result =
                Math.random() < 0.5
                    ? "🪙 PILE !"
                    : "🪙 FACE !";

            await interaction.reply(result);

            return;
        }

        // =====================================================
        // POLL
        // =====================================================

        if (interaction.commandName === "poll") {

            const question =
                interaction.options.getString(
                    "question"
                );

            const embed = new EmbedBuilder()
                .setTitle("📊 Sondage")
                .setDescription(question)
                .setFooter({
                    text:
                        `Créé par ${interaction.user.username}`
                });

            const message =
                await interaction.reply({
                    embeds: [embed],
                    fetchReply: true
                });

            await message.react("👍");
            await message.react("👎");

            return;
        }

        // =====================================================
        // SAY
        // =====================================================

        if (interaction.commandName === "say") {

            if (
                !interaction.member.permissions.has(
                    PermissionFlagsBits.ManageMessages
                )
            ) {

                await interaction.reply({
                    content:
                        "❌ Tu n'as pas la permission.",
                    ephemeral: true
                });

                return;
            }

            const message =
                interaction.options.getString(
                    "message"
                );

            await interaction.reply({
                content: "✅ Message envoyé.",
                ephemeral: true
            });

            await interaction.channel.send(
                message
            );

            return;
        }

    } catch (error) {

        console.error(
            "❌ Erreur de commande :",
            error
        );

        if (interaction.replied) {

            await interaction.followUp({
                content:
                    "❌ Une erreur est survenue.",
                ephemeral: true
            });

        } else {

            await interaction.reply({
                content:
                    "❌ Une erreur est survenue.",
                ephemeral: true
            });
        }
    }
});

// ============================================================
// CONNEXION
// ============================================================

async function start() {

    await deployCommands();

    await client.login(
        config.token
    );
}

start().catch(error => {

    console.error(
        "❌ Impossible de démarrer Mira :"
    );

    console.error(error);

});
