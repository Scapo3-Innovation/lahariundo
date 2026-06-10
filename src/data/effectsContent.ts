// Structured, sourced health content for the Effects page.
// Shape: substance -> organ -> { en, ml }. Plus whole-body warning, a closing
// note, and an optional pregnancy note shown on the female figure.
// Source: National Institute on Drug Abuse (NIDA) and public health authorities.
// Factual and non-graphic — no usage or dosing information.

export type SubstanceId = 'cannabis' | 'stimulants' | 'opioids' | 'smoking';
export type OrganId = 'brain' | 'lungs' | 'heart' | 'liver' | 'stomach' | 'kidneys';

export const ORGANS: OrganId[] = ['brain', 'lungs', 'heart', 'liver', 'stomach', 'kidneys'];
export const SUBSTANCES: SubstanceId[] = ['cannabis', 'stimulants', 'opioids', 'smoking'];

export interface Bilingual { en: string; ml: string }

export interface OrganEffect {
  text: Bilingual;
  /** 'danger' organs get the emergency styling + CTA (e.g. opioids → breathing). */
  severity?: 'danger';
  emergency?: boolean;
}

export interface SubstanceContent {
  /** Organs this substance most affects — these glow on the figure. */
  affected: OrganId[];
  organs: Record<OrganId, OrganEffect>;
  /** Whole-body warning (e.g. stimulants → body temperature). */
  bodyWarning?: Bilingual;
  /** Closing caution note (e.g. mixed/adulterated drugs). */
  note?: Bilingual;
  /** Shown only on the female figure, clearly framed. */
  pregnancy?: Bilingual;
}

export const EFFECTS: Record<SubstanceId, SubstanceContent> = {
  cannabis: {
    affected: ['brain', 'lungs', 'heart', 'stomach'],
    organs: {
      brain: {
        text: {
          en: 'Impairs short-term memory, attention, coordination and sense of time, and can trigger anxiety, fear or panic. Because the brain keeps developing into the mid-20s, use before 25 can affect memory and learning, and heavy long-term use is linked to lasting cognitive decline. It can raise the risk of psychosis in people who are predisposed.',
          ml: 'ഹ്രസ്വകാല ഓർമ്മ, ശ്രദ്ധ, ഏകോപനം, സമയബോധം എന്നിവയെ ദുർബലപ്പെടുത്തുന്നു; ഉത്കണ്ഠ, ഭയം, പരിഭ്രാന്തി എന്നിവ ഉണ്ടാക്കാം. തലച്ചോറ് 20-കളുടെ മധ്യം വരെ വികസിക്കുന്നതിനാൽ, 25 വയസ്സിന് മുൻപുള്ള ഉപയോഗം ഓർമ്മയെയും പഠനത്തെയും ബാധിക്കാം; കനത്ത ദീർഘകാല ഉപയോഗം സ്ഥിരമായ വൈജ്ഞാനിക തളർച്ചയുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു. മുൻകൂർ സാധ്യതയുള്ളവരിൽ മനോരോഗ സാധ്യത വർധിപ്പിക്കാം.',
        },
      },
      lungs: {
        text: {
          en: 'Smoking irritates and inflames the airways, causing chronic cough, bronchitis-like symptoms and increased airway resistance.',
          ml: 'പുകവലി ശ്വാസനാളങ്ങളെ പ്രകോപിപ്പിക്കുകയും വീക്കം ഉണ്ടാക്കുകയും ചെയ്യുന്നു — സ്ഥിരമായ ചുമ, ബ്രോങ്കൈറ്റിസ് പോലുള്ള ലക്ഷണങ്ങൾ, ശ്വാസതടസ്സം.',
        },
      },
      heart: {
        text: {
          en: 'Raises heart rate soon after use (it can stay elevated for around 3 hours) and is linked to a higher risk of heart attack, stroke and irregular heartbeat — especially for people with existing heart conditions.',
          ml: 'ഉപയോഗത്തിന് ഉടൻ ഹൃദയമിടിപ്പ് ഉയർത്തുന്നു (ഏകദേശം 3 മണിക്കൂർ വരെ തുടരാം); ഹൃദയാഘാതം, പക്ഷാഘാതം, ക്രമരഹിത മിടിപ്പ് എന്നിവയുടെ സാധ്യത കൂട്ടുന്നു — നിലവിൽ ഹൃദ്രോഗമുള്ളവരിൽ പ്രത്യേകിച്ച്.',
        },
      },
      stomach: {
        text: {
          en: 'Increases appetite, and can cause nausea, stomach pain or vomiting. Heavy long-term use can lead to repeated severe vomiting (cannabinoid hyperemesis syndrome).',
          ml: 'വിശപ്പ് കൂട്ടുന്നു; ഓക്കാനം, വയറുവേദന, ഛർദ്ദി എന്നിവ ഉണ്ടാക്കാം. കനത്ത ദീർഘകാല ഉപയോഗം ആവർത്തിച്ചുള്ള കടുത്ത ഛർദ്ദി (കന്നാബിനോയ്ഡ് ഹൈപ്പറെമിസിസ് സിൻഡ്രോം) ഉണ്ടാക്കാം.',
        },
      },
      liver: {
        text: {
          en: 'Not a primary target. Most physical harm from cannabis is to the brain, lungs and heart.',
          ml: 'പ്രധാന ലക്ഷ്യമല്ല. കഞ്ചാവിന്റെ ശാരീരിക ദോഷം കൂടുതലും തലച്ചോറ്, ശ്വാസകോശം, ഹൃദയം എന്നിവയ്ക്കാണ്.',
        },
      },
      kidneys: {
        text: {
          en: 'Not a primary target. Most physical harm from cannabis is to the brain, lungs and heart.',
          ml: 'പ്രധാന ലക്ഷ്യമല്ല. കഞ്ചാവിന്റെ ശാരീരിക ദോഷം കൂടുതലും തലച്ചോറ്, ശ്വാസകോശം, ഹൃദയം എന്നിവയ്ക്കാണ്.',
        },
      },
    },
    pregnancy: {
      en: 'Using during pregnancy is linked to lower birth weight and may affect the baby’s brain development.',
      ml: 'ഗർഭകാലത്ത് ഉപയോഗിക്കുന്നത് കുറഞ്ഞ ജനന ഭാരവുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു, കുഞ്ഞിന്റെ തലച്ചോറ് വികസനത്തെ ബാധിക്കാം.',
    },
  },

  stimulants: {
    affected: ['brain', 'heart', 'liver', 'kidneys', 'stomach'],
    organs: {
      brain: {
        text: {
          en: 'Floods the brain with serotonin and dopamine for short-term energy and euphoria, followed by a crash. It can cause anxiety, panic, confusion, paranoia and poor sleep; with regular use, depression and memory and attention problems.',
          ml: 'തലച്ചോറിനെ സെറോട്ടോണിൻ, ഡോപമിൻ കൊണ്ട് നിറയ്ക്കുന്നു — ഹ്രസ്വകാല ഊർജവും ഉന്മേഷവും, പിന്നെ തളർച്ച. ഉത്കണ്ഠ, പരിഭ്രാന്തി, ആശയക്കുഴപ്പം, സംശയം, മോശം ഉറക്കം; സ്ഥിരമായ ഉപയോഗത്തിൽ വിഷാദവും ഓർമ്മ-ശ്രദ്ധ പ്രശ്നങ്ങളും.',
        },
      },
      heart: {
        text: {
          en: 'Sharply raises heart rate and blood pressure and can cause dangerous rhythm problems and strain the heart. Long-term use is linked to heart-valve disease and heart failure.',
          ml: 'ഹൃദയമിടിപ്പും രക്തസമ്മർദവും കുത്തനെ ഉയർത്തുന്നു; അപകടകരമായ താള പ്രശ്നങ്ങളും ഹൃദയ സമ്മർദവും. ദീർഘകാല ഉപയോഗം ഹൃദയ വാൽവ് രോഗവും ഹൃദയസ്തംഭനവുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു.',
        },
      },
      liver: {
        text: {
          en: 'Long-term use can damage the liver, and severe reactions can lead to liver failure.',
          ml: 'ദീർഘകാല ഉപയോഗം കരളിന് കേടുവരുത്താം; ഗുരുതര പ്രതികരണങ്ങൾ കരൾ പരാജയത്തിലേക്ക് നയിക്കാം.',
        },
      },
      kidneys: {
        text: {
          en: 'Overheating and dehydration can lead to kidney damage or failure.',
          ml: 'അമിത ചൂടും നിർജ്ജലീകരണവും വൃക്ക കേടോ പരാജയമോ ഉണ്ടാക്കാം.',
        },
      },
      stomach: {
        text: {
          en: 'Reduces appetite and can cause nausea. Jaw clenching and teeth grinding are common.',
          ml: 'വിശപ്പ് കുറയ്ക്കുന്നു; ഓക്കാനം ഉണ്ടാക്കാം. താടിയെല്ല് മുറുക്കലും പല്ലുകടിയും സാധാരണം.',
        },
      },
      lungs: {
        text: {
          en: 'Not a primary target, though smoked forms can irritate the lungs and airways.',
          ml: 'പ്രധാന ലക്ഷ്യമല്ല, പക്ഷേ പുകയ്ക്കുന്ന രൂപങ്ങൾ ശ്വാസകോശത്തെ പ്രകോപിപ്പിക്കാം.',
        },
      },
    },
    bodyWarning: {
      en: 'Can cause a dangerous rise in body temperature, especially in hot, crowded places — this can be life-threatening.',
      ml: 'ശരീര താപനില അപകടകരമാംവിധം ഉയർത്താം — പ്രത്യേകിച്ച് ചൂടുള്ള, തിരക്കേറിയ സ്ഥലങ്ങളിൽ. ഇത് ജീവന് ഭീഷണിയാകാം.',
    },
    note: {
      en: 'Pills sold as MDMA are often mixed with other unknown drugs, so the effects are unpredictable and more dangerous.',
      ml: 'MDMA എന്ന പേരിൽ വിൽക്കുന്ന ഗുളികകളിൽ പലപ്പോഴും അജ്ഞാത മയക്കുമരുന്നുകൾ കലർന്നിരിക്കും, അതിനാൽ ഫലങ്ങൾ പ്രവചനാതീതവും കൂടുതൽ അപകടകരവുമാണ്.',
    },
    pregnancy: {
      en: 'Using during pregnancy can raise the risk of premature birth, low birth weight and pregnancy complications.',
      ml: 'ഗർഭകാലത്ത് ഉപയോഗിക്കുന്നത് മാസം തികയാത്ത പ്രസവം, കുറഞ്ഞ ജനന ഭാരം, ഗർഭ സങ്കീർണതകൾ എന്നിവയുടെ സാധ്യത കൂട്ടാം.',
    },
  },

  opioids: {
    affected: ['brain', 'lungs', 'heart', 'stomach', 'liver', 'kidneys'],
    organs: {
      brain: {
        text: {
          en: 'Bind to receptors that control pain, pleasure and breathing, causing euphoria and then drowsiness and clouded thinking. Long-term heroin use can damage the brain’s white matter, affecting decision-making and self-control.',
          ml: 'വേദന, സന്തോഷം, ശ്വസനം എന്നിവ നിയന്ത്രിക്കുന്ന റിസപ്റ്ററുകളിൽ ബന്ധിക്കുന്നു — ഉന്മേഷം, പിന്നെ മയക്കവും അവ്യക്ത ചിന്തയും. ദീർഘകാല ഹെറോയിൻ ഉപയോഗം തലച്ചോറിലെ വൈറ്റ് മാറ്റർ കേടാക്കി തീരുമാനമെടുക്കലിനെയും ആത്മനിയന്ത്രണത്തെയും ബാധിക്കാം.',
        },
      },
      lungs: {
        severity: 'danger',
        emergency: true,
        text: {
          en: 'Breathing is the main danger. In an overdose, breathing slows and can starve the brain of oxygen, leading to coma, brain damage or death. This is a medical emergency.',
          ml: 'ശ്വസനമാണ് പ്രധാന അപകടം. ഓവർഡോസിൽ ശ്വസനം മന്ദഗതിയിലായി തലച്ചോറിന് ഓക്സിജൻ കുറയും — കോമ, തലച്ചോറ് കേട്, അല്ലെങ്കിൽ മരണം. ഇത് ഒരു വൈദ്യ അടിയന്തരാവസ്ഥയാണ്.',
        },
      },
      heart: {
        text: {
          en: 'Can lower blood pressure. Injecting can cause infections of the heart lining and valves, and collapsed veins.',
          ml: 'രക്തസമ്മർദം കുറയ്ക്കാം. കുത്തിവയ്പ്പ് ഹൃദയ പാളിയുടെയും വാൽവുകളുടെയും അണുബാധയും ഞരമ്പുകൾ തകരലും ഉണ്ടാക്കാം.',
        },
      },
      stomach: {
        text: {
          en: 'Commonly cause constipation and nausea.',
          ml: 'സാധാരണയായി മലബന്ധവും ഓക്കാനവും ഉണ്ടാക്കുന്നു.',
        },
      },
      liver: {
        text: {
          en: 'Injecting raises the risk of infections such as hepatitis that damage the liver.',
          ml: 'കുത്തിവയ്പ്പ് ഹെപ്പറ്റൈറ്റിസ് പോലുള്ള അണുബാധകളുടെ സാധ്യത കൂട്ടി കരളിന് കേടുവരുത്തുന്നു.',
        },
      },
      kidneys: {
        text: {
          en: 'Injecting and the infections it can cause put extra strain on the kidneys and the rest of the body.',
          ml: 'കുത്തിവയ്പ്പും അത് ഉണ്ടാക്കാവുന്ന അണുബാധകളും വൃക്കകൾക്കും ശരീരത്തിനും അധിക സമ്മർദം നൽകുന്നു.',
        },
      },
    },
    note: {
      en: 'Fentanyl is often mixed into other drugs, which can make them unexpectedly deadly.',
      ml: 'ഫെന്റനൈൽ പലപ്പോഴും മറ്റ് മയക്കുമരുന്നുകളിൽ കലർത്തുന്നു, ഇത് അവയെ അപ്രതീക്ഷിതമായി മാരകമാക്കാം.',
    },
    pregnancy: {
      en: 'Using during pregnancy can cause dependence in the newborn (withdrawal after birth), which needs medical care.',
      ml: 'ഗർഭകാലത്ത് ഉപയോഗിക്കുന്നത് നവജാത ശിശുവിൽ ആശ്രയത്വം (ജനനശേഷം പിൻവലിക്കൽ) ഉണ്ടാക്കാം, വൈദ്യ പരിചരണം ആവശ്യമാണ്.',
    },
  },

  smoking: {
    affected: ['lungs', 'heart', 'brain', 'stomach'],
    organs: {
      lungs: {
        severity: 'danger',
        text: {
          en: 'The primary target. Damages airways and lung tissue, causing chronic cough, bronchitis, emphysema and COPD. Smoking is the leading cause of lung cancer. Even light smoking raises the risk.',
          ml: 'പ്രധാന ലക്ഷ്യം. ശ്വാസനാളങ്ങളും ശ്വാസകോശ ടിഷ്യൂയും കേടാക്കി സ്ഥിരമായ ചുമ, ബ്രോങ്കൈറ്റിസ്, എംഫിസിമ, COPD എന്നിവ ഉണ്ടാക്കുന്നു. ശ്വാസകോശ കാൻസറിന്റെ പ്രധാന കാരണം പുകവലിയാണ്. ചെറിയ പുകവലിയും അപകടം വർധിപ്പിക്കുന്നു.',
        },
      },
      heart: {
        text: {
          en: 'Raises heart rate and blood pressure, damages blood vessels and increases the risk of heart attack, stroke and peripheral artery disease.',
          ml: 'ഹൃദയമിടിപ്പും രക്തസമ്മർദവും ഉയർത്തുന്നു; രക്തനാളങ്ങൾ കേടാക്കി ഹൃദയാഘാതം, പക്ഷാഘാതം, പെരിഫറൽ ആർട്ടറി രോഗം എന്നിവയുടെ സാധ്യത കൂട്ടുന്നു.',
        },
      },
      brain: {
        text: {
          en: 'Nicotine is highly addictive and affects mood and concentration. Long-term smoking is linked to higher risk of stroke and cognitive decline.',
          ml: 'നിക്കോട്ടിൻ വളരെ ആസക്തി ഉണ്ടാക്കുന്നു; മനോഭാവവും ശ്രദ്ധയും ബാധിക്കുന്നു. ദീർഘകാല പുകവലി പക്ഷാഘാതത്തിന്റെയും വൈജ്ഞാനിക തളർച്ചയുടെയും സാധ്യത കൂട്ടുന്നു.',
        },
      },
      stomach: {
        text: {
          en: 'Increases the risk of stomach ulcers, acid reflux and some cancers of the digestive tract.',
          ml: 'വയറ് പുല്പയും ആസിഡ് റിഫ്ലക്സും ജീർണ്ണനാഴി കാൻസറുകളുടെയും സാധ്യത വർധിപ്പിക്കുന്നു.',
        },
      },
      liver: {
        text: {
          en: 'Not a primary target, though heavy smoking can add to overall health strain.',
          ml: 'പ്രധാന ലക്ഷ്യമല്ല, പക്ഷേ കനത്ത പുകവലി മൊത്തം ആരോഗ്യ സമ്മർദം കൂട്ടാം.',
        },
      },
      kidneys: {
        text: {
          en: 'Linked to higher risk of kidney disease over time, especially with other health conditions.',
          ml: 'കാലക്രമേണ വൃക്ക രോഗത്തിന്റെ സാധ്യതയുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു, പ്രത്യേകിച്ച് മറ്റ് ആരോഗ്യ പ്രശ്നങ്ങളോടെ.',
        },
      },
    },
    bodyWarning: {
      en: 'Second-hand smoke harms people nearby — especially children, pregnant women and people with asthma.',
      ml: 'പുകവലി മറ്റുള്ളവരെയും ബാധിക്കുന്നു — പ്രത്യേകിച്ച് കുട്ടികളെയും ഗർഭിണികളെയും ആസ്തമയുള്ളവരെയും.',
    },
    note: {
      en: 'Nicotine is highly addictive. Quitting is difficult but possible — free counselling and support are available through Vimukthi and government helplines.',
      ml: 'നിക്കോട്ടിൻ വളരെ ആസക്തി ഉണ്ടാക്കുന്നു. നിർത്തൽ ബുദ്ധിമുട്ടാണ്, പക്ഷേ സാധ്യമാണ് — വിമുക്തിയും സർക്കാർ ഹെൽപ്‌ലൈനുകളിലൂടെ സൗജന്യ കൗൺസലിംഗ് ലഭ്യമാണ്.',
    },
    pregnancy: {
      en: 'Smoking during pregnancy raises the risk of miscarriage, premature birth, low birth weight and sudden infant death.',
      ml: 'ഗർഭകാല പുകവലി ഗർഭപാതം, മാസം തികയാത്ത പ്രസവം, കുറഞ്ഞ ജനന ഭാരം, ശിശു മരണം എന്നിവയുടെ സാധ്യത കൂട്ടുന്നു.',
    },
  },
};
