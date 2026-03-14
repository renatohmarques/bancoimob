export const INITIAL_MONEY = 2500;

export const BOARD_SPACES = [
  {
    "index": 0,
    "title": "In\u00edcio",
    "type": "start",
    "description": "Receba R$ 200 ao passar.",
    "emoji": "\ud83c\udfc1"
  },
  {
    "index": 1,
    "title": "Jd. Bot\u00e2nico",
    "type": "property",
    "group": "brown",
    "emoji": "\ud83c\udf3f",
    "prices": {
      "buy": 60,
      "rent": 2,
      "casa": 10,
      "hotel": 30,
      "shopping": 90,
      "build_cost": 50
    }
  },
  {
    "index": 2,
    "title": "Sorte ou Rev\u00e9s",
    "type": "chance",
    "emoji": "\u2753"
  },
  {
    "index": 3,
    "title": "Empresa de Videogame",
    "type": "company",
    "group": "black",
    "emoji": "\ud83c\udfae",
    "prices": {
      "buy": 200,
      "multiplier": 50
    }
  },
  {
    "index": 4,
    "title": "Loja de Animais",
    "type": "property",
    "group": "brown",
    "emoji": "\ud83d\udc36",
    "prices": {
      "buy": 75,
      "rent": 4,
      "casa": 20,
      "hotel": 60,
      "shopping": 180,
      "build_cost": 50
    }
  },
  {
    "index": 5,
    "title": "Sorte ou Rev\u00e9s",
    "type": "chance",
    "emoji": "\u2753"
  },
  {
    "index": 6,
    "title": "Est\u00e1dio de Futebol",
    "type": "property",
    "group": "blue",
    "emoji": "\u26bd",
    "prices": {
      "buy": 220,
      "rent": 18,
      "casa": 90,
      "hotel": 250,
      "shopping": 700,
      "build_cost": 150
    }
  },
  {
    "index": 7,
    "title": "Empresa de Celular",
    "type": "company",
    "group": "blue",
    "emoji": "\ud83d\udcf1",
    "prices": {
      "buy": 200,
      "multiplier": 50
    }
  },
  {
    "index": 8,
    "title": "Gin\u00e1sio de Esporte",
    "type": "property",
    "group": "blue",
    "emoji": "\ud83c\udff8",
    "prices": {
      "buy": 220,
      "rent": 18,
      "casa": 90,
      "hotel": 250,
      "shopping": 700,
      "build_cost": 150
    }
  },
  {
    "index": 9,
    "title": "Deten\u00e7\u00e3o ou Visita",
    "type": "jail",
    "description": "Espa\u00e7o livre. Se voc\u00ea n\u00e3o foi mandado para c\u00e1, est\u00e1 apenas fazendo uma visita! Nada acontece.",
    "emoji": "\ud83d\ude93"
  },
  {
    "index": 10,
    "title": "Sorte ou Rev\u00e9s",
    "type": "chance",
    "emoji": "\u2753"
  },
  {
    "index": 11,
    "title": "Teatro",
    "type": "property",
    "group": "pink",
    "emoji": "\ud83c\udfad",
    "prices": {
      "buy": 180,
      "rent": 16,
      "casa": 80,
      "hotel": 220,
      "shopping": 600,
      "build_cost": 100
    }
  },
  {
    "index": 12,
    "title": "Cinema",
    "type": "property",
    "group": "pink",
    "emoji": "\ud83c\udfac",
    "prices": {
      "buy": 200,
      "rent": 14,
      "casa": 70,
      "hotel": 200,
      "shopping": 550,
      "build_cost": 100
    }
  },
  {
    "index": 13,
    "title": "Empresa de Brinquedos",
    "type": "company",
    "group": "white",
    "emoji": "\ud83e\uddf8",
    "prices": {
      "buy": 200,
      "multiplier": 50
    }
  },
  {
    "index": 14,
    "title": "F\u00e1brica de Massa Estrela",
    "type": "property",
    "group": "black",
    "emoji": "\u2b50",
    "prices": {
      "buy": 400,
      "rent": 35,
      "casa": 175,
      "hotel": 500,
      "shopping": 1100,
      "build_cost": 200
    }
  },
  {
    "index": 15,
    "title": "Loja de Doces",
    "type": "property",
    "group": "orange",
    "emoji": "\ud83c\udf6c",
    "prices": {
      "buy": 350,
      "rent": 50,
      "casa": 200,
      "hotel": 600,
      "shopping": 1400,
      "build_cost": 200
    }
  },
  {
    "index": 16,
    "title": "Escola",
    "type": "property",
    "group": "orange",
    "emoji": "\ud83c\udfeb",
    "prices": {
      "buy": 120,
      "rent": 8,
      "casa": 40,
      "hotel": 100,
      "shopping": 300,
      "build_cost": 50
    }
  },
  {
    "index": 17,
    "title": "Feriado",
    "type": "free_parking",
    "emoji": "\ud83c\udfd6\ufe0f"
  },
  {
    "index": 18,
    "title": "Biblioteca",
    "type": "property",
    "group": "red",
    "emoji": "\ud83d\udcda",
    "prices": {
      "buy": 100,
      "rent": 6,
      "casa": 30,
      "hotel": 90,
      "shopping": 270,
      "build_cost": 50
    }
  },
  {
    "index": 19,
    "title": "Empresa de Salgadinhos",
    "type": "company",
    "group": "red",
    "emoji": "\ud83e\udd68",
    "prices": {
      "buy": 200,
      "multiplier": 50
    }
  },
  {
    "index": 20,
    "title": "Compra Livre",
    "type": "free_buy",
    "description": "V\u00e1 para qualquer lugar e compre se quiser!",
    "emoji": "\ud83c\udd93"
  },
  {
    "index": 21,
    "title": "Sorte ou Rev\u00e9s",
    "type": "chance",
    "emoji": "\u2753"
  },
  {
    "index": 22,
    "title": "Hamburgueria",
    "type": "property",
    "group": "yellow",
    "emoji": "\ud83c\udf54",
    "prices": {
      "buy": 160,
      "rent": 10,
      "casa": 50,
      "hotel": 150,
      "shopping": 450,
      "build_cost": 100
    }
  },
  {
    "index": 23,
    "title": "Pizzaria",
    "type": "property",
    "group": "yellow",
    "emoji": "\ud83c\udf55",
    "prices": {
      "buy": 140,
      "rent": 12,
      "casa": 60,
      "hotel": 180,
      "shopping": 500,
      "build_cost": 100
    }
  },
  {
    "index": 24,
    "title": "Restaurante Japon\u00eas",
    "type": "property",
    "group": "yellow",
    "emoji": "\ud83c\udf63",
    "prices": {
      "buy": 140,
      "rent": 10,
      "casa": 50,
      "hotel": 150,
      "shopping": 450,
      "build_cost": 100
    }
  },
  {
    "index": 25,
    "title": "Empresa de Bolos",
    "type": "company",
    "group": "green",
    "emoji": "\ud83c\udf82",
    "prices": {
      "buy": 150,
      "multiplier": 40
    }
  },
  {
    "index": 26,
    "title": "V\u00e1 para Pris\u00e3o",
    "type": "go_to_jail",
    "emoji": "\ud83d\udc6e"
  },
  {
    "index": 27,
    "title": "Parque de Divers\u00f5es",
    "type": "property",
    "group": "green",
    "emoji": "\ud83c\udfa2",
    "prices": {
      "buy": 300,
      "rent": 28,
      "casa": 150,
      "hotel": 450,
      "shopping": 1000,
      "build_cost": 200
    }
  },
  {
    "index": 28,
    "title": "Sorte ou Rev\u00e9s",
    "type": "chance",
    "emoji": "\u2753"
  },
  {
    "index": 29,
    "title": "Pista de Patina\u00e7\u00e3o",
    "type": "property",
    "group": "green",
    "emoji": "\u26f8\ufe0f",
    "prices": {
      "buy": 300,
      "rent": 26,
      "casa": 130,
      "hotel": 390,
      "shopping": 900,
      "build_cost": 200
    }
  },
  {
    "index": 30,
    "title": "Pista de Kart",
    "type": "property",
    "group": "dark_blue",
    "emoji": "\ud83c\udfce\ufe0f",
    "prices": {
      "buy": 320,
      "rent": 26,
      "casa": 130,
      "hotel": 390,
      "shopping": 900,
      "build_cost": 200
    }
  },
  {
    "index": 31,
    "title": "Shopping Center",
    "type": "property",
    "group": "dark_blue",
    "emoji": "\ud83d\udecd\ufe0f",
    "prices": {
      "buy": 260,
      "rent": 26,
      "casa": 130,
      "hotel": 360,
      "shopping": 850,
      "build_cost": 150
    }
  },
  {
    "index": 32,
    "title": "Empresa de Roupas",
    "type": "company",
    "group": "purple",
    "emoji": "\ud83d\udc5a",
    "prices": {
      "buy": 150,
      "multiplier": 40
    }
  },
  {
    "index": 33,
    "title": "Supermercado",
    "type": "property",
    "group": "purple",
    "emoji": "\ud83d\uded2",
    "prices": {
      "buy": 280,
      "rent": 22,
      "casa": 110,
      "hotel": 330,
      "shopping": 800,
      "build_cost": 150
    }
  },
  {
    "index": 34,
    "title": "Sorte ou Rev\u00e9s",
    "type": "chance",
    "emoji": "\u2753"
  }
];

export const CHANCE_CARDS = [
  {
    "text": "Voc\u00ea ganhou na loteria! Receba R$ 200.",
    "amount": 200,
    "type": "receive"
  },
  {
    "text": "Pague a conta do hospital. Pague R$ 100.",
    "amount": -100,
    "type": "pay"
  },
  {
    "text": "Erro no banco a seu favor! Receba R$ 150.",
    "amount": 150,
    "type": "receive"
  },
  {
    "text": "Voc\u00ea foi multado por excesso de velocidade. Pague R$ 50.",
    "amount": -50,
    "type": "pay"
  },
  {
    "text": "Rendimento do seu fundo de investimentos. Receba R$ 50.",
    "amount": 50,
    "type": "receive"
  },
  {
    "text": "Dia do seu anivers\u00e1rio! Receba R$ 50 de cada jogador.",
    "amount": 50,
    "type": "receive_from_players"
  },
  {
    "text": "V\u00e1 direto para a pris\u00e3o. N\u00e3o passe pelo in\u00edcio.",
    "type": "go_to_jail"
  },
  {
    "text": "Volte 3 casas.",
    "type": "move_back",
    "spaces": 3
  }
];
