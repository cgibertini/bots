var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('listening to %s', server.url);
});

var connector = new builder.ChatConnector({
    appId: 'e57342cb-5083-474f-b1a1-2b6a2958da93',
    appPassword: 'rp2NY2N01myRwyGUVhDNbqB'
});
var bot = new builder.UniversalBot(connector);

server.post('/api/messages', connector.listen());

bot.endConversationAction('tchau', 'Tchau. Volte sempre que precisar :)', { matches: /^tchau|bye|até logo/i });
bot.beginDialogAction('ajuda', '/ajuda', { matches: /^ajuda/i });
bot.beginDialogAction('menu', '/menu', { matches: /^menu/i });

bot.beginDialogAction('ola', '/', { matches: /^Ola|Olá|Bom dia|Boa tarde|Boa Noite/i });


//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
    function (session) {
        // Send a greeting and show help.
        var card = new builder.HeroCard(session)
            .title("Atendimento Liberty Seguros")
            .text("Agente Especial")
            .images([
                 builder.CardImage.create(session, "https://logodownload.org/wp-content/uploads/2017/03/liberty-seguros-logo-6.png")
            ]);
        var msg = new builder.Message(session).attachments([card]);
        session.send(msg);
        session.send("Olá! Tudo bem com você?  \n  \n Sou o novo assistente de atendimento da Liberty Seguros.");
        session.send("Ainda Estou em treinamento, mas vou ajudar com suas dúvidas.");
        session.userData.greetings=true;
        builder.Prompts.text(session , "Vamos começar... qual seu nome?");
    },
    function (session, results) {        
        getName(session);
        session.beginDialog('/comecar');
    },
    function (session, results) {
        // Always say goodbye
        session.send("Ok... volte sempre que precisar de minha ajuda");
    }
]);

bot.dialog('/ola', [
    function (session) {
        if (session.userData.greetings && session.userData.greetingsCount <= 2)  
            session.endDialog("Olá Tudo bem com você?");
        else if (session.userData.greetings && session.userData.greetingsCount >= 2)
            session.endDialog("Olá"  + session.userData.name + ", tudo bem com você? Acho que já tivemos esta conversa :)");            
        else
            session.beginDialog("\comecar");
    }
]);

bot.dialog('/menu', [
    function (session) {
        builder.Prompts.choice(session, "Os assuntos que domino são:\n\n", "cep|sair");
    },
    function (session, results) {
        if (results.response && results.response.entity !== 'sair') {
            // Launch demo dialog
            session.beginDialog('/' + results.response.entity);
        } else {
            // Exit the menu
            session.endDialog();
        }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/menu');
    }
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });

bot.dialog('/comecar', [
    function (session) {
        builder.Prompts.choice(session, "Para que possamos começar me conte, você é:" , "Corretor|Segurado|Prestador", "button");
    },
    function (session, results) {
        if (results.response && results.response.entity !== 'sair') {
            // Launch demo dialog
            session.beginDialog('/' + results.response.entity);
        } else {
            // Exit the menu
            session.endDialog();
        }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        // session.replaceDialog('/comecar');
    }
]).reloadAction('reloadMenu', null, { matches: /^começo|voltar para o começo/i });

bot.dialog('/Corretor', [
    function (session) {
        builder.Prompts.choice(session, "Certo. Sua dúvida é sobre:" , "Apólice|Corretor Amigo|Cotação|Endosso|Proposta|Renovação|Vistoria|Outras");
        session.send("Tudo bem se não tiver certeza. A qualquer momento você pode pedir uma mãozinha, digitando 'ajuda'");
 
    },
    function (session, results) {
        if (results.response && results.response.entity !== 'sair') {
            // Launch demo dialog
            session.beginDialog('/' + results.response.entity);
        } else {
            // Exit the menu
            session.endDialog();
        }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/Corretor');
    }
]).reloadAction('reloadMenu', null, { matches: /^Corretor/i });


bot.dialog('/Apólice', [
    function (session) {
        session.send("Ok. Vamo falar obre Apólices.");
        builder.Prompts.choice(session, "Sua dúvida é sobre:  \n" , "Alteração de dados da apólice|Alteração de dados do Segurado|Alteração de Cobertura|Consulta de dados da Apólice|Cobertura a vidros|Impressão de Boletos|Nenhuma destas");
    },
    function (session, results) {
        if (results.response && results.response.entity === "Alteração de dados da apólice") {
            // Alteração de dados da apólice
            session.userData.option = results.response.entity;
            session.userData.msg = " \r\r Através de Endosso o corretor consegue mudar diversos dados do segurado, do veículo, dados de perfil.\r\r\
No entanto a única coisa que não é permitida realizar por endosso é alteração da data de vigência e correção de nome do segurado.\n\
Neste último caso deve fazer um DSO > cálculo de exceção.";
            
            session.beginDialog('/Answer');
        } else if (results.response && results.response.entity === "Alteração de dados do Segurado") {
            // Alteração de dados da apólice
            session.userData.option = results.response.entity;
            session.userData.msg = "";
            session.beginDialog('/Answer');
            
        } else if (results.response && results.response.entity === "Alteração de Cobertura|Consulta de dados da Apólice|Cobertura a vidros|Impressão de Boletos|Nenhuma destas") {
            // Alteração de dados da apólice
            session.userData.option = results.response.entity;
            session.userData.msg = "";          
            session.beginDialog('/Answer');   

            
        } else {
            // Exit the menu
            session.endDialog();
        }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/Apólice');
    }
]).reloadAction('reloadMenu', null, { matches: /^Apolice/i });

bot.dialog('/Alteração de dados da apólice', [
    function (session) {
        session.send(session.userData.option);
        session.send(session.userData.msg);  
        session.send("Alteração de dados da apólice");
        session.send("Através de Endosso o corretor consegue mudar diversos dados do segurado, do veículo, dados de perfil.\n\
No entanto a única coisa que não é permitida realizar por endosso é alteração da data de vigência e correção de nome do segurado.");
        session.send("Neste último caso deve fazer um DSO > cálculo de exceção.");  
        session.replaceDialog('/RespostaCorreta');
    }
]);

bot.dialog('/Answer', [
    function (session) {
        
        var answerCard = new builder.HeroCard(session)
            .title(session.userData.option)
            .text(session.userData.msg);
        var answerMsg = new builder.Message(session).attachments([answerCard]);
        session.send(answerMsg);

        session.replaceDialog('/RespostaCorreta');
    }
]);

bot.dialog('/RespostaCorreta',  [
    function (session) {
        builder.Prompts.choice(session, "Esta resposta atende à sua questão?" , "Sim|Não|Voltar ao Menu Apólice");
    },
    function (session, results) {
        if (results.response && results.response.entity !== 'Voltar ao Menu Apólice') {
            // Launch demo dialog
            session.beginDialog('/' + results.response.entity);
        } else {
            // Exit the menu
            session.replaceDialog('/Apólice');
            // session.endDialog();
        }
    }
]).reloadAction('reloadMenu', null, { matches: /^RespostaCorreta/i });

bot.dialog('/Sim', [
    function (session) {
        session.send("Que Bom! Sempre é bom ajudar :)");
        builder.Prompts.choice(session, "Você quer:" , "Voltar ao Menu Apólice|Voltar ao Início|Sair");
    },
    function (session, results) {
        if (results.response && results.response.entity === 'Voltar ao Menu Apólice') {
            // Launch demo dialog
            session.beginDialog('/Apólice');
        } else if (results.response && results.response.entity === 'Voltar ao Início') {
            // Launch demo dialog
            session.beginDialog('/Corretor');
        } else {
            // Exit the menu
            session.replaceDialog('/Sair');
            // session.endDialog();
        }
    }
]).reloadAction('reloadMenu', null, { matches: /^Sim/i });


bot.dialog('/Segurado', [
    function (session) {
        session.endDialog("O serviço do helpline é para atendimento exclusivo ao corretor.\n O fone da central de atendimento ao Segurado é 4004 5423 na Capital e Região Metropolitana e  0800 709 5423 para as demais localidades");
    }
]);

bot.dialog('/Prestador', [
    function (session) {
        session.endDialog("O serviço do helpline é para atendimento exclusivo ao corretor.\n O fone da central de atendimento ao Segurado é 4004 5423 na Capital e Região Metropolitana e  0800 709 5423 para as demais localidades");
    }
]);

bot.dialog('/cep', [
    function (session) {
        session.endDialog("Qual o cep que deseja consultar?");
    }
]);

bot.dialog('/ajuda', [
    function (session) {
        session.endDialog("Os comandos disponíveis a qualquer momento são:\n\n* menu - volta ao inicio da navegação.\n* tchau - Finaliza a conversa.\n* ajuda - Mostra esta ajuda.");
    }
]);

bot.dialog('/Sair', [
    function (session) {
        session.endDialog("Tchau!  :)");
        session.endDialog("Espero ter ajudado. Quando precisar estarei por aqui.");
    }
]);

// Funções Liberty
function getName(session) {
    name = session.message.text;
    session.userData.name = name;
    session.send("Olá, " + name);
}
