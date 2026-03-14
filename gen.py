import json

board = [
  { "index": 0, "title": "Início", "type": "start", "description": "Receba R$ 200 ao passar.", "emoji": "🏁" },
  { "index": 1, "title": "Jd. Botânico", "type": "property", "group": "brown", "emoji": "🌿", "prices": { "buy": 60, "rent": 2, "casa": 10, "hotel": 30, "shopping": 90, "build_cost": 50 } },
  { "index": 2, "title": "Sorte ou Revés", "type": "chance", "emoji": "❓" },
  { "index": 3, "title": "Empresa de Videogame", "type": "company", "group": "black", "emoji": "🎮", "prices": { "buy": 200, "multiplier": 50 } },
  { "index": 4, "title": "Loja de Animais", "type": "property", "group": "brown", "emoji": "🐶", "prices": { "buy": 75, "rent": 4, "casa": 20, "hotel": 60, "shopping": 180, "build_cost": 50 } },
  { "index": 5, "title": "Sorte ou Revés", "type": "chance", "emoji": "❓" },
  { "index": 6, "title": "Estádio de Futebol", "type": "property", "group": "blue", "emoji": "⚽", "prices": { "buy": 220, "rent": 18, "casa": 90, "hotel": 250, "shopping": 700, "build_cost": 150 } },
  { "index": 7, "title": "Empresa de Celular", "type": "company", "group": "blue", "emoji": "📱", "prices": { "buy": 200, "multiplier": 50 } },
  { "index": 8, "title": "Ginásio de Esporte", "type": "property", "group": "blue", "emoji": "🏸", "prices": { "buy": 220, "rent": 18, "casa": 90, "hotel": 250, "shopping": 700, "build_cost": 150 } },
  { "index": 9, "title": "Detenção ou Visita", "type": "jail", "description": "Espaço livre. Se você não foi mandado para cá, está apenas fazendo uma visita! Nada acontece.", "emoji": "🚓" },
  { "index": 10, "title": "Sorte ou Revés", "type": "chance", "emoji": "❓" },
  { "index": 11, "title": "Teatro", "type": "property", "group": "pink", "emoji": "🎭", "prices": { "buy": 180, "rent": 16, "casa": 80, "hotel": 220, "shopping": 600, "build_cost": 100 } },
  { "index": 12, "title": "Cinema", "type": "property", "group": "pink", "emoji": "🎬", "prices": { "buy": 200, "rent": 14, "casa": 70, "hotel": 200, "shopping": 550, "build_cost": 100 } },
  { "index": 13, "title": "Empresa de Brinquedos", "type": "company", "group": "white", "emoji": "🧸", "prices": { "buy": 200, "multiplier": 50 } },
  { "index": 14, "title": "Fábrica de Massa Estrela", "type": "property", "group": "black", "emoji": "⭐", "prices": { "buy": 400, "rent": 35, "casa": 175, "hotel": 500, "shopping": 1100, "build_cost": 200 } },
  { "index": 15, "title": "Loja de Doces", "type": "property", "group": "orange", "emoji": "🍬", "prices": { "buy": 350, "rent": 50, "casa": 200, "hotel": 600, "shopping": 1400, "build_cost": 200 } },
  { "index": 16, "title": "Biblioteca", "type": "property", "group": "orange", "emoji": "📚", "prices": { "buy": 100, "rent": 6, "casa": 30, "hotel": 90, "shopping": 270, "build_cost": 50 } },
  { "index": 17, "title": "Feriado", "type": "free_parking", "emoji": "🏖️" },
  { "index": 18, "title": "Escola", "type": "property", "group": "red", "emoji": "🏫", "prices": { "buy": 120, "rent": 8, "casa": 40, "hotel": 100, "shopping": 300, "build_cost": 50 } },
  { "index": 19, "title": "Empresa de Salgadinhos", "type": "company", "group": "red", "emoji": "🥨", "prices": { "buy": 200, "multiplier": 50 } },
  { "index": 20, "title": "Compra Livre", "type": "free_buy", "description": "Vá para qualquer lugar e compre se quiser!", "emoji": "🆓" },
  { "index": 21, "title": "Sorte ou Revés", "type": "chance", "emoji": "❓" },
  { "index": 22, "title": "Hamburgueria", "type": "property", "group": "yellow", "emoji": "🍔", "prices": { "buy": 160, "rent": 10, "casa": 50, "hotel": 150, "shopping": 450, "build_cost": 100 } },
  { "index": 23, "title": "Pizzaria", "type": "property", "group": "yellow", "emoji": "🍕", "prices": { "buy": 140, "rent": 12, "casa": 60, "hotel": 180, "shopping": 500, "build_cost": 100 } },
  { "index": 24, "title": "Restaurante Japonês", "type": "property", "group": "yellow", "emoji": "🍣", "prices": { "buy": 140, "rent": 10, "casa": 50, "hotel": 150, "shopping": 450, "build_cost": 100 } },
  { "index": 25, "title": "Empresa de Bolos", "type": "company", "group": "green", "emoji": "🎂", "prices": { "buy": 150, "multiplier": 40 } },
  { "index": 26, "title": "Vá para Prisão", "type": "go_to_jail", "emoji": "👮" },
  { "index": 27, "title": "Parque de Diversões", "type": "property", "group": "green", "emoji": "🎢", "prices": { "buy": 300, "rent": 28, "casa": 150, "hotel": 450, "shopping": 1000, "build_cost": 200 } },
  { "index": 28, "title": "Sorte ou Revés", "type": "chance", "emoji": "❓" },
  { "index": 29, "title": "Pista de Patinação", "type": "property", "group": "green", "emoji": "⛸️", "prices": { "buy": 300, "rent": 26, "casa": 130, "hotel": 390, "shopping": 900, "build_cost": 200 } },
  { "index": 30, "title": "Pista de Kart", "type": "property", "group": "dark_blue", "emoji": "🏎️", "prices": { "buy": 320, "rent": 26, "casa": 130, "hotel": 390, "shopping": 900, "build_cost": 200 } },
  { "index": 31, "title": "Shopping Center", "type": "property", "group": "dark_blue", "emoji": "🛍️", "prices": { "buy": 260, "rent": 26, "casa": 130, "hotel": 360, "shopping": 850, "build_cost": 150 } },
  { "index": 32, "title": "Empresa de Roupas", "type": "company", "group": "purple", "emoji": "👚", "prices": { "buy": 150, "multiplier": 40 } },
  { "index": 33, "title": "Supermercado", "type": "property", "group": "purple", "emoji": "🛒", "prices": { "buy": 280, "rent": 22, "casa": 110, "hotel": 330, "shopping": 800, "build_cost": 150 } },
  { "index": 34, "title": "Sorte ou Revés", "type": "chance", "emoji": "❓" }
]

chance_cards = [
  { "text": "Você ganhou na loteria! Receba R$ 200.", "amount": 200, "type": "receive" },
  { "text": "Pague a conta do hospital. Pague R$ 100.", "amount": -100, "type": "pay" },
  { "text": "Erro no banco a seu favor! Receba R$ 150.", "amount": 150, "type": "receive" },
  { "text": "Você foi multado por excesso de velocidade. Pague R$ 50.", "amount": -50, "type": "pay" },
  { "text": "Rendimento do seu fundo de investimentos. Receba R$ 50.", "amount": 50, "type": "receive" },
  { "text": "Dia do seu aniversário! Receba R$ 50 de cada jogador.", "amount": 50, "type": "receive_from_players" },
  { "text": "Vá direto para a prisão. Não passe pelo início.", "type": "go_to_jail" },
  { "text": "Volte 3 casas.", "type": "move_back", "spaces": 3 }
]

content = f"""export const INITIAL_MONEY = 2500;

export const BOARD_SPACES = {json.dumps(board, indent=2)};

export const CHANCE_CARDS = {json.dumps(chance_cards, indent=2)};
"""

with open('app/src/config/board.js', 'w', encoding='utf-8') as f:
    f.write(content)
