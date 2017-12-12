const dateInSeconds = (jsonDateString) => ~~(Date.parse(jsonDateString) / 1000)

module.exports = {
    target: '0xa3d736079d6bf7c14a96ab3ad131c349ceaf141e',

    endDate: dateInSeconds('2018-02-08T16:00:00.000Z'),

    minCap: 100,
    maxCap: 500
}