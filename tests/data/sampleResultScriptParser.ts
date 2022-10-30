export default {
  data: [
    {
      step: "Begin",
      timestamp: 1667141279,
      companies: [],
      totalChargingStations: [],
      totalChargingPower: 0,
    },
    {
      step: "Start station 1",
      timestamp: 1667141279,
      companies: [
        {
          id: 1,
          chargingStations: [1],
          chargingPower: 10,
        },
        {
          id: 3,
          chargingStations: [1],
          chargingPower: 10,
        },
      ],
      totalChargingStations: [1],
      totalChargingPower: 10,
    },
    {
      step: "Start station 2",
      timestamp: 1667141284,
      companies: [
        {
          id: 1,
          chargingStations: [1, 2],
          chargingPower: 20,
        },
        {
          id: 2,
          chargingStations: [2],
          chargingPower: 10,
        },
        {
          id: 3,
          chargingStations: [1],
          chargingPower: 10,
        },
      ],
      totalChargingStations: [1, 2],
      totalChargingPower: 20,
    },
    {
      step: "Start station all",
      timestamp: 1667141294,
      companies: [
        {
          id: 1,
          chargingStations: [1, 2, 3, 4, 5],
          chargingPower: 50,
        },
        {
          id: 2,
          chargingStations: [2, 3],
          chargingPower: 20,
        },
        {
          id: 3,
          chargingStations: [1, 4],
          chargingPower: 20,
        },
      ],
      totalChargingStations: [1, 2, 3, 4, 5],
      totalChargingPower: 50,
    },
    {
      step: "Stop station 2",
      timestamp: 1667141304,
      companies: [
        {
          id: 1,
          chargingStations: [1, 3, 4, 5],
          chargingPower: 40,
        },
        {
          id: 2,
          chargingStations: [2, 3],
          chargingPower: 20,
        },
        {
          id: 3,
          chargingStations: [1, 4],
          chargingPower: 20,
        },
      ],
      totalChargingStations: [1, 3, 4, 5],
      totalChargingPower: 40,
    },
    {
      step: "Stop station 3",
      timestamp: 1667141314,
      companies: [
        {
          id: 1,
          chargingStations: [1, 4, 5],
          chargingPower: 30,
        },
        {
          id: 2,
          chargingStations: [2, 3],
          chargingPower: 20,
        },
        {
          id: 3,
          chargingStations: [1, 4],
          chargingPower: 20,
        },
      ],
      totalChargingStations: [1, 4, 5],
      totalChargingPower: 30,
    },
    {
      step: "Stop station all",
      timestamp: 1667141319,
      companies: [],
      totalChargingStations: [],
      totalChargingPower: 0,
    },
    {
      step: "End",
      timestamp: 1667141319,
      companies: [],
      totalChargingStations: [],
      totalChargingPower: 0,
    },
  ],
};
