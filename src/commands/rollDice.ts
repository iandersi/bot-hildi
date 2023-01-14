import {CommandInteraction} from "discord.js";

export async function executeRollDice(interaction: CommandInteraction): Promise<void> {
    const numberOfDice = interaction.options.getInteger('amount');
    const variant = interaction.options.getInteger('variant');

    if (numberOfDice === null || variant === null) return interaction.reply('Hello? I need dice. Please?');
    if (numberOfDice < 1 || variant < 1) return interaction.reply("I'm not a sorcerer. :man_mage:");

    let resultArray: number[] = [];
    let sum = 0;

    if (numberOfDice <= 10) {
        for (let i = 0; i < numberOfDice; i++) {
            let roll = Math.floor(Math.random() * variant + 1);
            resultArray.push(roll);
            sum = sum + roll;
        }
        let resultString = resultArray.join(', ');
        return interaction.reply(`You rolled **${numberOfDice} d${variant}** dice (**${resultString}**). The sum of your roll is **${sum}**.`)
    } else {
        let max = numberOfDice * variant;
        let result = Math.floor(Math.random() * max + 1);
        return interaction.reply(`You rolled **${numberOfDice} d${variant}** dice. The sum of your roll is **${result}**.`);
    }
}
