export interface RawCountry {
  code: string;
  name: string;
  flag: string;
  curriculum: string;
  grades: { id: string; label: string }[];
}

const customCountries: Record<string, { curriculum: string; grades: { id: string; label: string }[] }> = {
  GH: {
    curriculum: "GES / WAEC",
    grades: [
      { id: "jhs1", label: "JHS 1" },
      { id: "jhs2", label: "JHS 2" },
      { id: "jhs3", label: "JHS 3 (BECE)" },
      { id: "shs1", label: "SHS 1" },
    ],
  },
  NG: {
    curriculum: "NERDC / WAEC",
    grades: [
      { id: "jss2", label: "JSS 2" },
      { id: "jss3", label: "JSS 3" },
      { id: "ss1", label: "SS 1" },
    ],
  },
  US: {
    curriculum: "Common Core",
    grades: [
      { id: "g6", label: "Grade 6" },
      { id: "g7", label: "Grade 7" },
      { id: "g8", label: "Grade 8" },
      { id: "g9", label: "Grade 9 (Algebra I)" },
    ],
  },
  GB: {
    curriculum: "GCSE",
    grades: [
      { id: "y8", label: "Year 8" },
      { id: "y9", label: "Year 9" },
      { id: "y10", label: "Year 10 (GCSE)" },
    ],
  },
  CA: {
    curriculum: "Provincial Curriculum",
    grades: [
      { id: "ca-g7", label: "Grade 7" },
      { id: "ca-g8", label: "Grade 8" },
      { id: "ca-g9", label: "Grade 9" },
      { id: "ca-g10", label: "Grade 10" },
    ],
  },
  AU: {
    curriculum: "Australian Curriculum",
    grades: [
      { id: "au-y7", label: "Year 7" },
      { id: "au-y8", label: "Year 8" },
      { id: "au-y9", label: "Year 9" },
      { id: "au-y10", label: "Year 10" },
    ],
  },
  IN: {
    curriculum: "CBSE / ICSE",
    grades: [
      { id: "in-c7", label: "Class 7" },
      { id: "in-c8", label: "Class 8" },
      { id: "in-c9", label: "Class 9" },
      { id: "in-c10", label: "Class 10" },
    ],
  },
  ZA: {
    curriculum: "CAPS Curriculum",
    grades: [
      { id: "za-g7", label: "Grade 7" },
      { id: "za-g8", label: "Grade 8" },
      { id: "za-g9", label: "Grade 9" },
      { id: "za-g10", label: "Grade 10" },
    ],
  },
  KE: {
    curriculum: "CBC Curriculum",
    grades: [
      { id: "ke-g7", label: "Grade 7" },
      { id: "ke-g8", label: "Grade 8" },
      { id: "ke-g9", label: "Grade 9" },
      { id: "ke-g10", label: "Grade 10" },
    ],
  },
  FR: {
    curriculum: "French National Curriculum",
    grades: [
      { id: "fr-6eme", label: "6ème" },
      { id: "fr-5eme", label: "5ème" },
      { id: "fr-4eme", label: "4ème" },
      { id: "fr-3eme", label: "3ème" },
    ],
  },
  ES: {
    curriculum: "LOMLOE / Bachillerato",
    grades: [
      { id: "es-1eso", label: "1º ESO" },
      { id: "es-2eso", label: "2º ESO" },
      { id: "es-3eso", label: "3º ESO" },
      { id: "es-4eso", label: "4º ESO" },
    ],
  },
  DE: {
    curriculum: "Abitur / Gymnasium",
    grades: [
      { id: "de-k7", label: "Klasse 7" },
      { id: "de-k8", label: "Klasse 8" },
      { id: "de-k9", label: "Klasse 9" },
      { id: "de-k10", label: "Klasse 10" },
    ],
  },
  MX: {
    curriculum: "SEP Curriculum",
    grades: [
      { id: "mx-1sec", label: "1º Secundaria" },
      { id: "mx-2sec", label: "2º Secundaria" },
      { id: "mx-3sec", label: "3º Secundaria" },
    ],
  },
  JP: {
    curriculum: "MEXT Curriculum",
    grades: [
      { id: "jp-jh1", label: "Junior High 1" },
      { id: "jp-jh2", label: "Junior High 2" },
      { id: "jp-jh3", label: "Junior High 3" },
    ],
  },
  CN: {
    curriculum: "National Curriculum",
    grades: [
      { id: "cn-g7", label: "Grade 7" },
      { id: "cn-g8", label: "Grade 8" },
      { id: "cn-g9", label: "Grade 9" },
    ],
  },
  SG: {
    curriculum: "GCE O-Level / MOE",
    grades: [
      { id: "sg-s1", label: "Secondary 1" },
      { id: "sg-s2", label: "Secondary 2" },
      { id: "sg-s3", label: "Secondary 3" },
      { id: "sg-s4", label: "Secondary 4" },
    ],
  },
  NZ: {
    curriculum: "NCEA Curriculum",
    grades: [
      { id: "nz-y9", label: "Year 9" },
      { id: "nz-y10", label: "Year 10" },
      { id: "nz-y11", label: "Year 11" },
    ],
  },
  BR: {
    curriculum: "BNCC Curriculum",
    grades: [
      { id: "br-a7", label: "7º Ano" },
      { id: "br-a8", label: "8º Ano" },
      { id: "br-a9", label: "9º Ano" },
    ],
  },
  PK: {
    curriculum: "National Curriculum",
    grades: [
      { id: "pk-c7", label: "Class 7" },
      { id: "pk-c8", label: "Class 8" },
      { id: "pk-c9", label: "Class 9" },
      { id: "pk-c10", label: "Class 10" },
    ],
  },
  BD: {
    curriculum: "NCTB Curriculum",
    grades: [
      { id: "bd-c7", label: "Class 7" },
      { id: "bd-c8", label: "Class 8" },
      { id: "bd-c9", label: "Class 9" },
      { id: "bd-c10", label: "Class 10" },
    ],
  },
};

const spanishSpeaking = new Set([
  "AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "SV", "GQ", "GT", "HN", "NI", "PA", "PY", "PE", "UY", "VE"
]);

const frenchSpeaking = new Set([
  "BE", "BJ", "BF", "BI", "CF", "TD", "KM", "CG", "CD", "CI", "DJ", "GA", "GN", "HT", "MG", "ML", "MC", "NE", "RW", "SN", "TG", "TN", "VU"
]);

const caribbean = new Set([
  "AG", "BS", "BB", "BZ", "DM", "GD", "GY", "KN", "LC", "VC", "TT"
]);

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const rawCountriesList = [
  { code: "AF", name: "Afghanistan" },
  { code: "AX", name: "Åland Islands" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AS", name: "American Samoa" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AI", name: "Anguilla" },
  { code: "AQ", name: "Antarctica" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AW", name: "Aruba" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BM", name: "Bermuda" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BQ", name: "Bonaire, Sint Eustatius and Saba" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BV", name: "Bouvet Island" },
  { code: "BR", name: "Brazil" },
  { code: "IO", name: "British Indian Ocean Territory" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "CV", name: "Cabo Verde" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "KY", name: "Cayman Islands" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CX", name: "Christmas Island" },
  { code: "CC", name: "Cocos (Keeling) Islands" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CD", name: "Congo (DRC)" },
  { code: "CG", name: "Congo" },
  { code: "CK", name: "Cook Islands" },
  { code: "CR", name: "Costa Rica" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CW", name: "Curaçao" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" },
  { code: "FK", name: "Falkland Islands" },
  { code: "FO", name: "Faroe Islands" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GF", name: "French Guiana" },
  { code: "PF", name: "French Polynesia" },
  { code: "TF", name: "French Southern Territories" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GI", name: "Gibraltar" },
  { code: "GR", name: "Greece" },
  { code: "GL", name: "Greenland" },
  { code: "GD", name: "Grenada" },
  { code: "GP", name: "Guadeloupe" },
  { code: "GU", name: "Guam" },
  { code: "GT", name: "Guatemala" },
  { code: "GG", name: "Guernsey" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HM", name: "Heard Island and McDonald Islands" },
  { code: "VA", name: "Holy See" },
  { code: "HN", name: "Honduras" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IM", name: "Isle of Man" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JE", name: "Jersey" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KP", name: "North Korea" },
  { code: "KR", name: "South Korea" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MO", name: "Macao" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MQ", name: "Martinique" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "YT", name: "Mayotte" },
  { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MS", name: "Montserrat" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NC", name: "New Caledonia" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "NU", name: "Niue" },
  { code: "NF", name: "Norfolk Island" },
  { code: "MP", name: "Northern Mariana Islands" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PS", name: "Palestine" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PN", name: "Pitcairn" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "PR", name: "Puerto Rico" },
  { code: "QA", name: "Qatar" },
  { code: "RE", name: "Réunion" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "BL", name: "Saint Barthélemy" },
  { code: "SH", name: "Saint Helena" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "MF", name: "Saint Martin" },
  { code: "PM", name: "Saint Pierre and Miquelon" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "São Tomé and Príncipe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SX", name: "Sint Maarten" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "GS", name: "South Georgia and the South Sandwich Islands" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SJ", name: "Svalbard and Jan Mayen" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TK", name: "Tokelau" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TC", name: "Turks and Caicos Islands" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "UM", name: "United States Minor Outlying Islands" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "VG", name: "British Virgin Islands" },
  { code: "VI", name: "U.S. Virgin Islands" },
  { code: "WF", name: "Wallis and Futuna" },
  { code: "EH", name: "Western Sahara" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];

export const RAW_COUNTRIES: RawCountry[] = rawCountriesList.map(c => {
  const code = c.code;
  if (customCountries[code]) {
    return {
      code,
      name: c.name,
      flag: getFlagEmoji(code),
      ...customCountries[code],
    };
  }

  let curriculum = "National Curriculum";
  let grades: { id: string; label: string }[] = [];
  const lowerCode = code.toLowerCase();

  if (spanishSpeaking.has(code)) {
    curriculum = "Educación Secundaria";
    grades = [
      { id: `${lowerCode}-g7`, label: "7º Grado" },
      { id: `${lowerCode}-g8`, label: "8º Grado" },
      { id: `${lowerCode}-g9`, label: "9º Grado" },
    ];
  } else if (frenchSpeaking.has(code)) {
    curriculum = "Curriculum National";
    grades = [
      { id: `${lowerCode}-g6`, label: "6ème" },
      { id: `${lowerCode}-g5`, label: "5ème" },
      { id: `${lowerCode}-g4`, label: "4ème" },
      { id: `${lowerCode}-g3`, label: "3ème" },
    ];
  } else if (caribbean.has(code)) {
    curriculum = "CSEC / CXC Curriculum";
    grades = [
      { id: `${lowerCode}-f1`, label: "Form 1" },
      { id: `${lowerCode}-f2`, label: "Form 2" },
      { id: `${lowerCode}-f3`, label: "Form 3" },
    ];
  } else {
    curriculum = `${c.name} National Curriculum`;
    grades = [
      { id: `${lowerCode}-g7`, label: "Grade 7" },
      { id: `${lowerCode}-g8`, label: "Grade 8" },
      { id: `${lowerCode}-g9`, label: "Grade 9" },
      { id: `${lowerCode}-g10`, label: "Grade 10" },
    ];
  }

  return {
    code,
    name: c.name,
    flag: getFlagEmoji(code),
    curriculum,
    grades,
  };
});
