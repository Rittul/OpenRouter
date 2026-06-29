const prisma = require("../src/config/prisma");

async function main() {

    await prisma.credit.update({
        where: {
            user_id: 2
        },
        data: {
            balance: 0.5
        }
    });

    console.log("Balance updated");

    await prisma.$disconnect();
}

main();