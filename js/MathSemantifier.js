/*
 * MathSemantifier.js
 * @author Toloaca Ion
 */



function append(html) {
    $("#results").append(html);
}

function processNotPositions(data) {
    data = JSON.parse(data)
    globalData = data
    // FOR TESTING ONLY
    data["message"] = decodeURIComponent(data["message"])
    console.log("Status: " + data["status"]);
    console.log("Message: " + data["message"]);
    console.log("Payload:");
    console.log(data["payload"]);
    var resultPageHeader = "Detected notations: <br>";
    $("#results").append(resultPageHeader);
    for (var key in data["payload"]) {
        //         append('</br><span>' + key.split("_").join(" ").replace(/P\d+N\d+$/,"") + '</span><br>');
        var cur = "<div class=\"custom-row\">";
        
        for (var posArrIndex in data["payload"][key]) {
            var start = data.payload[key][posArrIndex].position[0][0];
            var length = data.payload[key][posArrIndex].position[0][1];
            var substring = data.payload[key][posArrIndex].position[0][2];
            var pos = math(decodeURIComponent(substring));
            var id = key + "_" + start + "_" + length;
            var info = 'key=\"' + key + '\" ';
            info += 'start=\"' + start + '\" ';
            info += 'length=\"' + length + '\" ';
            var html = '<button class="notation_pos not-btn btn btn-default" ' + info + '>' + key.split("_").join(" ").replace(/P\d+N\d+$/, "") + '</button>';
            cur += html
            break;
        }
        cur += "</div>";
        append(cur);
    }
    installNotationPosHandler(data);
}

function installNotationPosHandler(data) {
    $('.notation_pos').click(function(e) {
        console.log(".notation_pos button pressed\n");
        key = $(this).attr('key')
        start = $(this).attr('start')
        length = $(this).attr('length')
        result = []
        $.each(data.payload[key], function(index, value) {
            var currStart = value.position[0][0];
            var currLen = value.position[0][1];
            var currStr = value.position[0][2];
            if (currStart == start && currLen == length) {
                result.push(value)
            }
        })
        resultData = {}
        resultData.status = "OK"
        resultData.message = data.message
        resultData.payload = result
        resultData.key = key
        displayArguments(resultData)
    });
}

//{"status":"OK","payload":[{"position":[[0,52]],"argRuleN651A1ArgSeq":[[0,32],[42,10]]}],"key":"...","message":"..."}
function displayArguments(data) {
    
    console.log("In display arguments\n");
    console.log(data);
    
    $('#results').empty();
    
    var resultPageHeader = data["status"] + "<br>" + data["message"] + "<br>";
    //     $("#results").append(resultPageHeader);
    var key = data.key;
    $("#results").append('<div>' + key.split("_").join(" ").replace(/P\d+N\d+$/, "") + '</div>');
    for (var i in data["payload"]) {
        
        var presentIndex = Number(i) + 1
        console.log(presentIndex)
        append('<button class="argument_pos btn btn-default" index="' + i + '"> Choice ' + presentIndex + '</button>');
        append('<br>');
        for (var key in data["payload"][i]) {
            if (key == "position") {
                continue;
            }
            for (var posArrIndex in data["payload"][i][key]) {
                var start = data["payload"][i][key][posArrIndex][0];
                var length = data["payload"][i][key][posArrIndex][1];
                var substring = data["payload"][i][key][posArrIndex][2];
                var info = 'key=\"' + key + '\" ';
                var pos = math(decodeURIComponent(substring));
                var argNr = "argRuleN124A1ArgSeq".replace(/(^.*N\d+A)(\d+)(Arg.*$)/,"$2")
                var html = '<span> Argument ' + argNr + ': ' + pos + '; </span></br>';
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
        var requestData = JSON.stringify({
            'status': 'OK',
            'payload': payload,
            'key': data.key,
            'input': data.message
        });
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
    var result = decodeURIComponent(data.cml);
    result = decodeURIComponent(result);
    console.log(data.cml);
    console.log(result);
    editor.getDoc().setValue(result);
    $("#results").empty();
    data = {};
}
