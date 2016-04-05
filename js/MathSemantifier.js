/*
 * MathSemantifier.js
 * @author Toloaca Ion
 */



function append(html) {
    $("#results").append(html);
}

function processNotPositions(data) {
    data = JSON.parse(data)
    data["message"] = decodeURIComponent(data["message"])
    console.log("Status: " + data["status"]);
    console.log("Message: " + data["message"]);
    console.log("Payload:");
    console.log(data["payload"]);
    var resultPageHeader = "Status: " + data["status"] + "<br>" + "Message: " + data["message"] + "<br>";
    $("#results").append(resultPageHeader);
    for (var key in data["payload"]) {
        append('</br><span>' + key + '</span><br>');
        append('<div>Positions: </div>')
        for (var posArrIndex in data["payload"][key]) {
            var start = data["payload"][key][posArrIndex][0];
            var length = data["payload"][key][posArrIndex][1];
            var pos = '[' + start + ", " + length + ']';
            var id = key + "_" + start + "_" + length;
            var info = 'key=\"' + key + '\" ';
            info += 'start=\"' + start + '\" ';
            info += 'length=\"' + length + '\" ';
            var html = '<button class="notation_pos" ' + info + '>' + pos + '</button>';
            // 
            append(html);
            append('<span> </span>');
        }
    }
    installNotationPosHandler(data);
}

function installNotationPosHandler(data) {
    $('.notation_pos').click(function(e) {
        console.log(".notation_pos button pressed\n");
        var input = data["message"];
        var url = parsingEngineURL + "/get_arguments";
        var json = {
            input: input,
            key: $(this).attr('key'),
            start: $(this).attr('start'),
            length: $(this).attr('length')
        }
        $.post(url, json, displayArguments);
        console.log($(this).attr('key') + " " + $(this).attr('start') + " " + $(this).attr('length'));
    });
}

//{"status":"OK","payload":[{"position":[[0,52]],"argRuleN651A1ArgSeq":[[0,32],[42,10]]}],"key":"...","message":"..."}
function displayArguments(arg) {
    data = JSON.parse(arg);
    data["message"] = decodeURIComponent(data["message"])
    
    console.log("In display arguments\n");
    console.log(arg);
    console.log(data);
    
    $('#results').empty();
    
    var resultPageHeader = data["status"] + "<br>" + data["message"] + "<br>";
    $("#results").append(resultPageHeader);
    $("#results").append('<div>' + data["key"] + '</div>');
    for (var i in data["payload"]) {
        console.log("In loop in display arguments " + i);
        append('<button class="argument_pos" index="' + i + '"> Argument positions choice ' + i + '</button>');
        append('<br>');
        for (var key in data["payload"][i]) {
            if (key == "position") {
                continue;
            }
            for (var posArrIndex in data["payload"][i][key]) {
                var start = data["payload"][i][key][posArrIndex][0];
                var length = data["payload"][i][key][posArrIndex][1];
                var info = 'key=\"' + key + '\" ';
                var pos = '[' + start + ", " + length + ']';
                var html = '<span>' + key + ': ' + pos + '; </span>';
                append(html);
                append('<span> </span>');
            }
        }
    }
    installDisplayArgsHandler(data);
}

function installDisplayArgsHandler(data) {
    $('.argument_pos').click(function(e) {
        console.log(".argument_pos used\n");
        console.log(data);
        var payload = data.payload[$(this).attr('index')];
        var requestData = encodeURIComponent(JSON.stringify({
            'status': 'OK',
            'payload': payload,
            'key': data.key,
            'input': data.message
        }));
        console.log("Request data:\n");
        console.log(requestData);
        $.ajax({
            type: "POST",
            url: mmtURL + "/:marpa/getContentMathML?=",
            data: requestData,
            contentType: "text/plain",
            success: replaceArgs
        });
    });
}

function replaceArgs(data) {
    console.log("replaceArgs");
    console.log(data);
    var result = unescape(data.cml);
    result = decodeURIComponent(result);
    console.log(data.cml);
    console.log(result);
    $("#editor").val(result);
    $("#results").empty();
    data = {};
    console.log("Work complete");
}
