export default {
  "Actor": {
    "1": {
      "id": 1,
      "name": "Crab",
      "prefab": "fishes/Crab/CrabActor",
      "attackType": 1,
      "attack": 40,
      "hurtAudio": "attacking2",
      "deadAudio": "dying3",
      "defence": 10,
      "hp": 100,
      "rage": 10,
      "speed": 2,
      "taunt": 20,
      "MainSkill": 1,
      "buff1": 1
    },
    "2": {
      "id": 2,
      "name": "Prianha",
      "prefab": "fishes/Piranha/PrianhaActor",
      "attackType": 1,
      "attack": 30,
      "hurtAudio": "attacking3",
      "deadAudio": "dying4",
      "defence": 10,
      "hp": 120,
      "rage": 10,
      "speed": 3,
      "taunt": 30,
      "MainSkill": 1,
      "buff1": 2
    },
    "3": {
      "id": 3,
      "name": "HuangZhong",
      "prefab": "fishes/HuangZhong/HuangZhongActor",
      "attackType": 2,
      "attack": 50,
      "hurtAudio": "hurt4",
      "deadAudio": "dying2",
      "defence": 5,
      "hp": 90,
      "rage": 10,
      "speed": 5,
      "taunt": 10,
      "MainSkill": 1,
      "buff1": 1
    },
    "4": {
      "id": 4,
      "name": "LvMeng",
      "prefab": "fishes/LvMeng/LvMengActor",
      "attackType": 1,
      "attack": 60,
      "hurtAudio": "hurt1",
      "deadAudio": "dying2",
      "defence": 10,
      "hp": 100,
      "rage": 30,
      "speed": 4,
      "taunt": 20,
      "MainSkill": 2,
      "buff1": 2
    },
    "5": {
      "id": 5,
      "name": "Octopus",
      "prefab": "fishes/Octopus/OctopusActor",
      "attackType": 1,
      "attack": 20,
      "hurtAudio": "hurt2",
      "deadAudio": "dying2",
      "defence": 10,
      "hp": 120,
      "rage": 30,
      "speed": 4,
      "taunt": 20,
      "MainSkill": 2,
      "buff1": 1
    },
    "6": {
      "id": 6,
      "name": "ZhaoLiao",
      "prefab": "fishes/ZhangLiao/ZhangLiaoActor",
      "attackType": 1,
      "attack": 30,
      "hurtAudio": "hurt3",
      "deadAudio": "dying2",
      "defence": 10,
      "hp": 150,
      "rage": 20,
      "speed": 2,
      "taunt": 20,
      "MainSkill": 1,
      "buff1": 1
    },
    "7": {
      "id": 7,
      "name": "ZhaoYun",
      "prefab": "fishes/ZhaoYun/ZhaoYunActor",
      "attackType": 1,
      "attack": 80,
      "hurtAudio": "hurt1",
      "deadAudio": "dying2",
      "defence": 10,
      "hp": 100,
      "rage": 10,
      "speed": 6,
      "taunt": 1,
      "MainSkill": 1,
      "buff1": 2
    },
    "8": {
      "id": 8,
      "name": "XiaoQiao",
      "prefab": "fishes/XiaoQiao/XiaoQiaoActor",
      "attackType": 2,
      "attack": 20,
      "hurtAudio": "hurt5",
      "deadAudio": "dying1",
      "defence": 10,
      "hp": 120,
      "rage": 10,
      "speed": 5,
      "taunt": 10,
      "MainSkill": 3,
      "buff1": ""
    },
    "9": {
      "id": 9,
      "name": "XuYou",
      "prefab": "fishes/XuYou/XuYouActor",
      "attackType": 2,
      "attack": 40,
      "hurtAudio": "hurt2",
      "deadAudio": "dying2",
      "defence": 1,
      "hp": 100,
      "rage": 30,
      "speed": 5,
      "taunt": 10,
      "MainSkill": 4,
      "buff1": ""
    },
    "10": {
      "id": 10,
      "name": "XuChu",
      "prefab": "fishes/XuChu/XuChuActor",
      "attackType": 1,
      "attack": 80,
      "hurtAudio": "hurt3",
      "deadAudio": "dying2",
      "defence": 5,
      "hp": 150,
      "rage": 10,
      "speed": 7,
      "taunt": 20,
      "MainSkill": 5,
      "buff1": ""
    }
  },
  "Buff": {
    "1": {
      "id": 1,
      "effects": 1,
      "audio": "fishes/Audios/taunt"
    },
    "2": {
      "id": 2,
      "effects": 2,
      "audio": "fishes/Audios/taunt"
    },
    "3": {
      "id": 3,
      "effects": 3,
      "audio": "fishes/Audios/healing1"
    }
  },
  "Effect": {
    "1": {
      "id": 1,
      "name": "嘲讽",
      "duration": 5,
      "property": "taunt",
      "propertyValue": 30
    },
    "2": {
      "id": 2,
      "name": "嘲讽",
      "duration": 30,
      "property": "taunt",
      "propertyValue": 10
    },
    "3": {
      "id": 3,
      "name": "治疗",
      "duration": -1,
      "property": "hp",
      "propertyValue": 30
    }
  },
  "MainSkill": {
    "1": {
      "id": 1,
      "name": "嘲讽",
      "buffs": 1,
      "shouldMove": 1,
      "rageCost": 50
    },
    "2": {
      "id": 2,
      "name": "跳劈",
      "buffs": "",
      "shouldMove": 2,
      "rageCost": 50
    },
    "3": {
      "id": 3,
      "name": "群体治疗",
      "buffs": 3,
      "shouldMove": 1,
      "rageCost": 50
    },
    "4": {
      "id": 4,
      "name": "审时度势",
      "buffs": "",
      "shouldMove": 2,
      "rageCost": 50
    },
    "5": {
      "id": 5,
      "name": "虎痴撼地",
      "buffs": "",
      "shouldMove": 2,
      "rageCost": 50
    }
  },
  "Stage": {
    "1": {
      "id": 1,
      "fisheActors": "1,1,1"
    },
    "2": {
      "id": 2,
      "fisheActors": "2,2,3"
    },
    "3": {
      "id": 3,
      "fisheActors": "3,3,4"
    },
    "4": {
      "id": 4,
      "fisheActors": "3,4,5,6"
    },
    "5": {
      "id": 5,
      "fisheActors": "3,4,5,6,7"
    }
  }
};