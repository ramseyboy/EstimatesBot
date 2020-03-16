import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    if (req.body === {}) {
        context.res = {
            status: 400,
            body: "Must pass optimistic, pessimistic and most likely estimates in order"
        };
        return;
    }

    const pert = (optimistic: string, pessimistic: string, mostLikely: string) => {
        let o = +optimistic;
        let p = +pessimistic;
        let ml = +mostLikely;

        if (isNaN(o) || isNaN(p) || isNaN(ml)) {
            throw Error('Estimates must all be valid numbers')
        }
        // E = (o + 4ml + p) / 6
        return Math.round(((o + (4 * ml) + p) / 6));
    };

    const query = parseQuery(req.body);

    const text:string = query.text;
    const params: string[] = text.split(' ');
    const estimate = pert(params[0], params[1], params[2]);

    context.res = {
        status: 200,
        headers: { 'Content-Type':'application/json' },
        body: {
            "response_type": "in_channel",
            "text": `Your PERT estimate is ${estimate}, seems a bit high?`,
        }
    };
};

function parseQuery(qstr): any {
    var query = {};
    var a = qstr.substr(0).split('&');
    for (var i = 0; i < a.length; i++) {
        var b = a[i].split('=');
        query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '').replace(new RegExp("\\+", 'g'), ' ');
    }
    return query;
}

export default httpTrigger;
