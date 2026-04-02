const showlog = (req, res, next) => {
    const log = `time: ${new Date().toLocaleString()} method: ${req.method} url: ${req.url}`
    console.log(log);
    next();
};

module.exports = { showlog };