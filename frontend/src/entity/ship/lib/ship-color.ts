const shipColors: Record<string, string> = {
  UNKNOWN: "#777777", // серый для неизвестных
  PASSENGER: "#2ECC71", // зеленый
  CARGO: "#3498DB", // синий
  TANKER: "#E74C3C", // красный
  FISHING: "#F39C12", // оранжевый
  HIGH_SPEED: "#9B59B6", // пурпурный
  PILOT: "#1ABC9C", // бирюзовый
  TOWING: "#95A5A6", // светло-серый
  OTHER: "#34495E", // темный синий
};

export const shipColor = (shipType: number): string => {
  let category: string;

  switch (true) {
    case shipType >= 60 && shipType <= 69:
      category = "PASSENGER";
      break;
    case shipType >= 70 && shipType <= 79:
      category = "CARGO";
      break;
    case shipType >= 80 && shipType <= 89:
      category = "TANKER";
      break;
    case shipType >= 30 && shipType <= 39:
      category = "FISHING";
      break;
    case shipType >= 10 && shipType <= 19:
      category = "HIGH_SPEED";
      break;
    case shipType >= 50 && shipType <= 59:
      category = "PILOT";
      break;
    case shipType >= 40 && shipType <= 49:
      category = "TOWING";
      break;
    case (shipType >= 20 && shipType <= 29) ||
      (shipType >= 90 && shipType <= 99):
      category = "OTHER";
      break;
    default:
      category = "UNKNOWN";
  }

  return shipColors[category] ?? shipColors.UNKNOWN;
};
