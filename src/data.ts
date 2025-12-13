import { HSNEntry, MinistryStat } from './types';

// A representative subset of the 11,651 codes mentioned in the PDF for demonstration purposes.
// In a real production app, this would be fetched from a backend or a large static JSON file.
export const HSN_DATA: HSNEntry[] = [
  // Agriculture
  { sno: 1, chapter: "6", hsCode: "6011000", description: "BULBS, TUBERS, TUBEROUS ROOTS, CORMS, CROWN AND RHIZOMES, DORMANT", ministry: "D/O AGRICULTURE & FARMERS WELFARE" },
  { sno: 2, chapter: "6", hsCode: "6012010", description: "BULBS HORTICULTURAL", ministry: "D/O AGRICULTURE & FARMERS WELFARE" },
  { sno: 6, chapter: "6", hsCode: "6021000", description: "UNROOTED CUTTINGS AND SLIPS OF LIVE PLANTS", ministry: "D/O AGRICULTURE & FARMERS WELFARE" },
  { sno: 25, chapter: "7", hsCode: "7011000", description: "POTATO SEEDS FRESH OR CHILLED", ministry: "D/O AGRICULTURE & FARMERS WELFARE" },
  { sno: 29, chapter: "7", hsCode: "7032000", description: "GARLIC FRESH OR CHILLED", ministry: "D/O AGRICULTURE & FARMERS WELFARE" },
  { sno: 97, chapter: "8", hsCode: "8039010", description: "BANANAS, FRESH", ministry: "D/O AGRICULTURE & FARMERS WELFARE" },
  { sno: 100, chapter: "8", hsCode: "8043000", description: "PINEAPPLES FRESH OR DRIED", ministry: "D/O AGRICULTURE & FARMERS WELFARE" },
  
  // Ayush
  { sno: 1, chapter: "12", hsCode: "12112000", description: "GINSNG ROOTS FRSH/DRID W/N CUT CRSHD/PWDRD", ministry: "M/O AYUSH" },
  { sno: 29, chapter: "12", hsCode: "12119057", description: "ASHWAGANDHA (WITHANIA SOMNIFERA)", ministry: "M/O AYUSH" },
  { sno: 31, chapter: "30", hsCode: "30039011", description: "MEDICANTS OF AYURVEDIC SYSTEM", ministry: "M/O AYUSH" },

  // Chemicals
  { sno: 1, chapter: "27", hsCode: "27071000", description: "BANZOLE (BENZENE)", ministry: "D/O CHEMICALS AND PETRO-CHEMICALS" },
  { sno: 6, chapter: "28", hsCode: "28011000", description: "CHLORINE", ministry: "D/O CHEMICALS AND PETRO-CHEMICALS" },
  { sno: 36, chapter: "28", hsCode: "28062000", description: "CHLORO-SULPHURIC ACID", ministry: "D/O CHEMICALS AND PETRO-CHEMICALS" },
  { sno: 220, chapter: "28", hsCode: "28353900", description: "OTHER POLYPHOSPHATES", ministry: "D/O CHEMICALS AND PETRO-CHEMICALS" },
  
  // Fertilizers
  { sno: 1, chapter: "31", hsCode: "31010010", description: "GUANO", ministry: "D/O FERTILIZERS" },
  { sno: 5, chapter: "31", hsCode: "31022100", description: "AMMONIUM SULPHATE", ministry: "D/O FERTILIZERS" },
  { sno: 18, chapter: "31", hsCode: "31043000", description: "POTASSIUM SULPHATE", ministry: "D/O FERTILIZERS" },

  // Pharmaceuticals
  { sno: 1, chapter: "17", hsCode: "17023010", description: "GLUCOSE LIQUID", ministry: "D/O PHARMACEUTICALS" },
  { sno: 220, chapter: "29", hsCode: "29411010", description: "PENICILLINS AND ITS SALTS", ministry: "D/O PHARMACEUTICALS" },
  { sno: 226, chapter: "29", hsCode: "29412010", description: "STREPTOMYCINS", ministry: "D/O PHARMACEUTICALS" },
  { sno: 416, chapter: "30", hsCode: "30049051", description: "ISONIAZID", ministry: "D/O PHARMACEUTICALS" },

  // Electronics
  { sno: 3, chapter: "84", hsCode: "84433100", description: "MACHINES WHICH PERFORM TWO OR MORE FUNCTIONS OF PRINTING, COPYING OR FACSIMILE", ministry: "M/O ELECTRONICS AND IT" },
  { sno: 11, chapter: "84", hsCode: "84713010", description: "PERSONAL COMPUTER (LAPTOP, PALMTOP, ETC)", ministry: "M/O ELECTRONICS AND IT" },
  { sno: 40, chapter: "85", hsCode: "85171300", description: "SMARTPHONES", ministry: "M/O ELECTRONICS AND IT" },
  { sno: 171, chapter: "85", hsCode: "85423100", description: "MONOLITHIC INTEGRATED CIRCUITS - DIGITAL", ministry: "M/O ELECTRONICS AND IT" },

  // Heavy Industries
  { sno: 7, chapter: "84", hsCode: "84021100", description: "WTRTUBE BOILRS WTH A STM PRDCTN>45T/HR", ministry: "M/O HEAVY INDUSTRIES" },
  { sno: 24, chapter: "84", hsCode: "84073110", description: "SPRK-IGNTN ENGINES FOR MOTOR CARS", ministry: "M/O HEAVY INDUSTRIES" },
  { sno: 280, chapter: "84", hsCode: "84287000", description: "INDUSTRIAL ROBOTS", ministry: "M/O HEAVY INDUSTRIES" },

  // Textiles
  { sno: 1, chapter: "30", hsCode: "30051010", description: "ADHESIVE GAUZE BANDAGE", ministry: "M/O TEXTILES" },
  { sno: 486, chapter: "52", hsCode: "52095120", description: "SAREE", ministry: "M/O TEXTILES" },
  { sno: 487, chapter: "52", hsCode: "52095130", description: "SHIRTING FABRICS", ministry: "M/O TEXTILES" },
  { sno: 1590, chapter: "61", hsCode: "61091000", description: "T-SHIRTS ETC OF COTTON", ministry: "M/O TEXTILES" },

  // Steel
  { sno: 27, chapter: "72", hsCode: "72011000", description: "NON-ALLOY PIG IRON CONTNG <=0.5% PHOSPHRS", ministry: "M/O STEEL" },
  { sno: 62, chapter: "72", hsCode: "72042920", description: "WASTE AND SCRAP OF HIGH SPEED STEEL", ministry: "M/O STEEL" },
  { sno: 102, chapter: "72", hsCode: "72081000", description: "FLAT-ROLD PRODUCTS, IN COILS NT FURTHER WORKED THN HOT-ROLD WTH PATRN IN RELIEF", ministry: "M/O STEEL" },

  // Commerce
  { sno: 18, chapter: "9", hsCode: "9011111", description: "COFFEE ARABICA PLANTATION `A`", ministry: "D/O COMMERCE" },
  { sno: 50, chapter: "9", hsCode: "9022010", description: "GREEN TEA IN PCKTS>3KG BUT<=20 KG", ministry: "D/O COMMERCE" },

  // New & Renewable Energy
  { sno: 1, chapter: "85", hsCode: "85414200", description: "PHOTOVOLTAIC CELLS NOT ASSEMBLED IN MODULES OR MADE UP INTO PANELS", ministry: "M/O NEW AND RENEWABLE ENERGY" },

  // Mines
  { sno: 2, chapter: "25", hsCode: "25010020", description: "ROCK SALT", ministry: "M/O MINES" },
  { sno: 8, chapter: "25", hsCode: "25041020", description: "GRAPHITE AMORPHOUS (POWDER/FLAKES)", ministry: "M/O MINES" },
  
  // Railways
  { sno: 1, chapter: "86", hsCode: "86011000", description: "RAIL LOCOMOTIVES POWERED FROM AN EXTERNAL SOURCE OF ELECTRICITY", ministry: "M/O RAILWAYS" },
  { sno: 10, chapter: "86", hsCode: "86061010", description: "4-WHEELER TANK WAGONS PAY-LOAD > 23 TONNES", ministry: "M/O RAILWAYS" },

  // Petroleum
  { sno: 1, chapter: "27", hsCode: "27090000", description: "PETROLEUM OILS AND OILS OBTAINED FROM BITUMINOUS MINERALS CRUDE", ministry: "M/O PETROLEUM AND NATURAL GAS" },
  { sno: 10, chapter: "27", hsCode: "27101241", description: "MOTOR GASOLINE CONFORMING TO STANDARD IS 2796", ministry: "M/O PETROLEUM AND NATURAL GAS" },

  // Food Processing
  { sno: 137, chapter: "4", hsCode: "4071100", description: "OF FOWLS OF THE SPECIES GALLUS DOMESTICUS", ministry: "M/O FOOD PROCESSING INDUSTRIES" },
  { sno: 200, chapter: "23", hsCode: "23011010", description: "MEAT MEALS AND PELLETS(INCL TANKAGE)", ministry: "M/O FOOD PROCESSING INDUSTRIES" },
];

export const MINISTRY_STATS: MinistryStat[] = [
  { name: "D/O AGRICULTURE & FARMERS WELFARE", count: 289, color: "#16a34a" },
  { name: "M/O AYUSH", count: 49, color: "#ca8a04" },
  { name: "D/O CHEMICALS AND PETRO-CHEMICALS", count: 1900, color: "#2563eb" },
  { name: "D/O FERTILIZERS", count: 29, color: "#0891b2" },
  { name: "D/O PHARMACEUTICALS", count: 618, color: "#db2777" },
  { name: "M/O ELECTRONICS AND IT", count: 178, color: "#9333ea" },
  { name: "M/O HEAVY INDUSTRIES", count: 841, color: "#475569" },
  { name: "M/O TEXTILES", count: 2176, color: "#ea580c" },
  { name: "M/O STEEL", count: 567, color: "#57534e" },
  { name: "M/O MINES", count: 666, color: "#65a30d" },
  { name: "D/O COMMERCE", count: 348, color: "#0d9488" },
  { name: "M/O FOOD PROCESSING", count: 869, color: "#dc2626" },
];