export const handleRequest = (req, res, cb, userId = null) => {
    try {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            body = body ? JSON.parse(body) : {};
            req.body = body;

            cb(req, res, userId)
        });
    } catch (err) {
        console.log(err);
    }
};
