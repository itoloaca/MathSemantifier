 
    function append(html) {
        $("#results").append(html);
    }

    function postUrl(url) {
        return 'proxy.php?url=' + encodeURIComponent(url);
    }

    function populate(jsonString) {
        data = JSON.parse(jsonString);
        console.log("Status: " + data["status"]);
        console.log("Message: " + data["message"]);
        console.log("Payload:");
        console.log(data["payload"]);
        var resultPageHeader = "Status: " +  data["status"] + "<br>" 
            + "Message: " + data["message"] + "<br>";
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
                var html = '<button class="notation_pos" ' + info + '>' + pos + '</button>'; // 
                append(html);
                append('<span> </span>');
            }
        }
    }

    function replaceArgs(data) {
        console.log("replaceArgs CALLED\n");
        console.log(data);
        console.log("Marpa: work done -> closing window\n");
    }


    function installDisplayArgsHandler(data) {
        $('.argument_pos').click(function(e) {
            console.log(".argument_pos button pressed\n");
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
                url: "${headers.uuid}/replaceArgs",
                type: 'post',
                data: requestData,
                contentType: 'application/json',
                dataType: 'json',
                success: replaceArgs,
            });
        });
    }

    //{"status":"OK","payload":[{"position":[[0,52]],"argRuleN651A1ArgSeq":[[0,32],[42,10]]}],"key":"...","message":"..."}
    function displayArguments(arg) {
        console.log("In display arguments\n");
        console.log(arg);
        var data = JSON.parse(arg);
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

    function getArguments(input, key, start, length) {
        console.log("getArgs url = ${headers.uuid}/getArguments");
        $.get("${headers.uuid}/getArguments?input=" + input + "&key=" + key + "&start=" + start + "&length=" + length,
            displayArguments);
    }

    function installNotationPosHandler() {
        $('.notation_pos').click(function(e) {
            console.log(".notation_pos button pressed\n");
            var input = data["message"];
            getArguments(input, $(this).attr('key'), $(this).attr('start'), $(this).attr('length'));
            console.log($(this).attr('key') + " " + $(this).attr('start') + " " + $(this).attr('length'));
        });
    }


