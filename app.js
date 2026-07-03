// ===== 老庄 App - lazy study reader =====
(function () {
  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);
  const DATA_VERSION = "20260703-xuanli-281-polish";

  let tab = "home";
  let curVer = "王弼本";
  let curTr = "河上公注";
  let curDDJCh = null;
  let curZZIdx = 0;
  let curZZGrp = "";
  let curConceptTitle = "";
  let curConceptCat = "全部";
  let conceptQuery = "";
  let readerMode = "all";
  let readerSize = "normal";
  let noteFold = false;
  let searchData = [];

  let APP_INDEX = null;
  let QUOTES = [];
  let CONCEPTS = null;
  let DDJ_META = null;
  let DDJ_INDEX = null;
  let ZZ_META = null;
  let ZZ_INDEX = null;
  const ddjCache = new Map();
  const zzCache = new Map();
  let searchReady = false;

  const COMMENTATORS = {
    河上公注: { title: "河上公", meta: "汉代传说注家 · 黄老治身治国一路", text: "《河上公章句》重在养生、治国与道术实践，常把经文读成内修和君政治理的双重指引。" },
    王弼注: { title: "王弼", meta: "魏晋玄学代表 · 以无释道", text: "王弼注重义理辨析，以“无”为本体枢纽，解释有无、体用、自然与名教之间的关系。" },
    通用白话译文: { title: "白话译文", meta: "现代汉语辅助阅读", text: "用于先通句意，再回到原文和注疏细读。译文只作入门桥梁，不替代原文的多义空间。" },
    苏辙: { title: "苏辙", meta: "北宋学者 · 儒道会通", text: "苏辙《老子解》多从修身、治心与政治得失入手，文气平易，适合和王弼、河上公互参。" },
    "白玉蟾《道德宝章》": { title: "白玉蟾", meta: "南宋内丹家 · 南宗道教重要人物", text: "白玉蟾解《老》常带内丹与修炼色彩，重视身心工夫、神气归根与道教修持语境。" },
    "黄元吉《道德经注释》": { title: "黄元吉", meta: "清代道教学者 · 内丹义理解经", text: "黄元吉注重性命双修与返本复命，常把经文章句落实到炼心、炼气和日用工夫。" },
    "杜光庭《道德真经广圣义》": { title: "杜光庭", meta: "唐末五代道教学者 · 广引经史道书", text: "《道德真经广圣义》解释唐玄宗御注系统，体例铺陈详密，兼具注、疏、义和大量典故互证。" },
    郭象注: { title: "郭象", meta: "西晋玄学家 · 《庄子注》核心注家", text: "郭象重在独化、自生和玄学义理，常把庄子的寓言读成万物各顺其性、无待自足的思想。" },
    成玄英疏: { title: "成玄英", meta: "唐代道教学者 · 重玄学代表", text: "成玄英疏承郭象而更详，常以重玄、遣执、双非双遣解释《庄子》，适合细读义理层次。" },
    "郭庆藩《庄子集释》": { title: "郭庆藩", meta: "清代学者 · 《庄子集释》编纂者", text: "《庄子集释》汇合郭象注、成玄英疏、陆德明释文及郭庆藩案语，材料广博，适合做集注式深读。" },
  };

  const LINEAGE = {
    versions: [
      {
        title: "《老子》《道德经》的传世系统",
        text: "传世《老子》不是单一文本，而是长期抄写、注解、刊刻后形成的系统。影响最大的两支，是王弼注本和河上公章句本：王弼本偏义理玄学，文字简洁，常作为士人、哲学读法的底本；河上公本偏治身、治国、养生和道教实践，在道教和民间流传极广。严遵《老子指归》不是通行章句注，而是借《老子》建立黄老式的天道、治道、身心学说。傅奕本保存较多古本异文，价值主要在校勘。读传世本时要知道：注家常常不只是解释文字，也会反过来塑造我们看到的《老子》面貌。",
      },
      {
        title: "出土文献带来的《老子》新面貌",
        text: "出土本改变了人们对《老子》的认识。郭店楚简本年代早，篇章不全，约为通行本的一部分，显示战国中期前后《老子》可能还处在摘编、讲习、流动状态。马王堆帛书甲乙本出土于西汉早期墓葬，常见“德经在前、道经在后”的次序，且未必完全按后世八十一章分章。北大汉简本保存较完整，说明西汉时期《老子》文本已经更接近成熟形态，但仍有异文和次序差异。出土文献告诉我们：不要把今天通行本看作从一开始就固定不变的原貌。",
      },
      {
        title: "《老子》从经典到《道德真经》",
        text: "《老子》原是先秦诸子书，汉代以后被黄老政治、养生方术、魏晋玄学和道教修持不断重读。到唐代，老子被尊为皇室祖先，《老子》被尊为《道德真经》，出现御注、义疏、道藏收录和官方讲习。于是它同时拥有多重身份：哲学上讲道体与有无，政治上讲清静无为与治国，修身上讲少私寡欲，道教中又讲守一、养气、内丹和成真。同一章在王弼、河上公、杜光庭、白玉蟾那里会读出不同方向，正是因为经典身份已经层层叠加。",
      },
      {
        title: "《庄子》：从五十二篇到三十三篇",
        text: "《汉书·艺文志》著录《庄子》五十二篇，今天通行本却是三十三篇，分内篇七、外篇十五、杂篇十一。这个今本系统基本由郭象注本奠定。换句话说，我们今天读到的《庄子》，不是汉代著录的五十二篇原样保存，而是经过魏晋注家整理、删汰、编次和解释后稳定下来的本子。内篇通常被视为最能代表庄周思想的核心部分，外篇、杂篇则保存庄子后学、道家论辩、黄老思想和诸子互相批评的广阔材料。读《庄子》要同时看到“庄周思想”和“庄学传统”。",
      },
      {
        title: "《南华真经》与道教化的《庄子》",
        text: "唐代以后，《庄子》被尊为《南华真经》，庄周被尊为南华真人。这个命名改变了读法：它不再只是诸子书，也成为道教经典。郭象注提供玄学义理，成玄英疏加入重玄学和道教修道论，陆德明音义保存读音、异文和训诂。三者合在一起，使《庄子》从寓言奇书变为经学式注疏体系。后世道藏本、宋元义海、明清注解多在这个“南华真经”框架中展开。",
      },
      {
        title: "清代以来的集注与现代整理",
        text: "清代考据学兴盛后，老庄研究进入校勘、训诂、辑佚和版本比较的时代。读《老子》，要比较王弼本、河上公本、傅奕本和后来出土本；读《庄子》，郭庆藩《庄子集释》汇集郭象注、成玄英疏、陆德明音义，并吸收清代诸家考证，成为集大成工具。王先谦《庄子集解》较简明，适合快速参看。近现代刘文典、王叔岷、朱谦之、高亨、陈鼓应、陈可抒等继续推进校释、注译和现代哲学阐发，使老庄研究同时面向古典文献学、思想史和公共阅读。",
      },
    ],
    figures: [
      { name: "严遵", era: "西汉", work: "《老子指归》", text: "方向：不是逐句训诂，而是借《老子》建立一套天道、治道、身心修养的综合解释。｜内容：常把道理解为天地运行和政治秩序背后的根本法则，讨论君主如何虚静、无欲、顺时而治，也讨论人如何保身全性。｜影响：代表汉代黄老学的深层读法，说明早期老学并不只是清谈玄理，而与帝王术、灾异天人、养生修身都有关。" },
      { name: "河上公", era: "汉代传说注家", work: "《老子河上公章句》", text: "方向：重治身、养生、守气，同时把身体治理和国家治理并读。｜内容：解释“谷神”“玄牝”“抱一”等语时，常落到精气神、五脏、守柔、节欲、安民等层面；讲“无为”时既是君主不扰民，也是修道者不耗神。｜影响：后来道教读《老子》的核心底本之一，影响养生派、符箓道教和民间老学，也让《道德经》成为身国同构的经典。" },
      { name: "《老子想尔注》一系", era: "东汉至六朝道教", work: "《老子想尔注》", text: "方向：天师道系统的教团化解释，把《老子》读成戒律、修道和共同体秩序。｜内容：强调奉道、积善、守诫、戒贪欲、远邪伪，许多章句被解释为修道者日常行为规范，而不只是抽象哲学。｜影响：它说明《道德经》很早就进入道教制度内部，成为教团伦理和修行规约的经典依据。" },
      { name: "葛玄、葛洪", era: "三国至东晋道教", work: "道教经典传承与神仙道论述", text: "方向：不是单一章句注家，而是把老庄、神仙、方术、养生和道教经典传统连接起来。｜内容：葛洪《抱朴子》一方面承认儒家伦理和世俗功业，一方面讨论神仙、金丹、守一、导引等修炼，常以老庄的清静、贵生、少欲为理论背景。｜影响：推动老庄思想进入道教修炼和神仙信仰系统，使“道”不只是玄理，也成为可修、可证、可养生的道路。" },
      { name: "王弼", era: "魏晋", work: "《老子道德经注》《老子指略》", text: "方向：以“无”为本，建立高度抽象的玄学义理。｜内容：他解释“有生于无”“道常无为”等，不重神仙养生，而重本末、体用、言意、自然与名教之间的关系；“无”不是空无，而是万有得以成立的根本。｜影响：王弼本成为士人读《老子》的主流底本之一，深刻影响魏晋玄学、宋明义理学和现代哲学式老学阐释。" },
      { name: "崔譔、司马彪", era: "魏晋", work: "早期《庄子》注", text: "方向：郭象以前的重要旧注系统，偏重名物、章句、训诂和早期义理解释。｜内容：二人注本大多散佚，但后世音义、类书、注疏仍保存若干材料，可见当时《庄子》文本篇数、字句和解释都比今本更复杂。｜影响：他们让我们知道郭象注本不是凭空出现，而是在多种早期庄学注本基础上整理、竞争、取舍之后形成的。" },
      { name: "向秀", era: "魏晋", work: "《庄子注》旧注系统", text: "方向：魏晋玄学读庄的重要开端，重在从寓言中发明自然、逍遥和名教关系。｜内容：向秀注今不完整，但其思想被认为与郭象注关系密切，常把庄子的奇诡寓言解释为万物各任其性、人在现实秩序中求得精神通达。｜影响：推动《庄子》从诸子寓言书转为玄学核心文本，影响郭象以及后世关于“逍遥”“齐物”的基本读法。" },
      { name: "郭象", era: "西晋", work: "《庄子注》", text: "方向：今本《庄子》三十三篇的关键整理者和玄学解释者。｜内容：核心概念包括独化、自生、性分、适性、无待；他常把庄子寓言解释为万物各自生成、各安其分，不必外求一个主宰。｜影响：今天通行的《庄子》结构基本由郭象本奠定，后世读《庄子》无论赞同还是反驳，几乎都绕不开郭象注。" },
      { name: "傅奕", era: "唐初", work: "傅奕本《老子》", text: "方向：更重要的是版本校勘意义，而不是注疏义理；它代表传世系统中保存古本异文的一路。｜内容：傅奕本保存不少与王弼本、河上公本不同的文字、章序和句读面貌，可用来观察唐以前《老子》传抄的差异。它不是教人如何修炼或如何治国，而是给校勘者提供“还有另一种写法”的证据。｜影响：后世校勘《道德经》常借傅奕本观察异文，尤其在马王堆、郭店、北大简出土以前，它是理解古本差异的重要线索。" },
      { name: "陆德明", era: "唐代", work: "《经典释文》", text: "方向：音义、训诂、异文整理，不直接建构哲学体系，却是读经基础。｜内容：为《老子》《庄子》等记录读音、别本、难字解释和旧注线索；《庄子音义》尤其保存许多古读和异文。｜影响：后世校勘《庄子》、辨别通假和章句，常要回到陆德明；郭庆藩《集释》也大量吸收其音义材料。" },
      { name: "唐玄宗李隆基", era: "唐代", work: "《道德真经御注》", text: "方向：帝王注经，把《老子》纳入国家礼制、政治合法性和道教尊崇。｜内容：解释《老子》时兼顾治国、修身和尊道，语气较平正，重在把“清静无为”转成君主治世的原则。｜影响：唐代尊老子为皇室祖先，《道德经》由诸子书进一步成为国家推崇的《道德真经》，推动后续道教义疏如杜光庭系统展开。" },
      { name: "成玄英", era: "唐代道士", work: "《南华真经疏》及重玄学阐释", text: "方向：承郭象注而作疏，融入唐代重玄学。｜内容：常用双遣、遣执、非有非无、忘言忘象解释《庄子》，把齐物、逍遥、无己读成破除一切执著的修道过程。｜影响：成疏与郭象注合成《南华真经注疏》的主体，深刻影响道教庄学，也让《庄子》成为重玄哲学的重要经典。" },
      { name: "李荣", era: "唐代重玄学", work: "老庄义疏与重玄论述", text: "方向：重玄学代表，重在对“玄”本身再加破除，不让读者把“道”“无”“玄”再执为一个固定对象。｜内容：他不满足于说“有无皆遣”，还要继续遣除对“遣除”的执著；解释老庄时常把语言、概念、分别心看作需要层层放下的对象。｜影响：代表唐代道教哲学的精密化，使老庄解释从普通清静无为推进到更抽象的认识论、语言观和修道论。" },
      { name: "陆希声", era: "唐代", work: "《道德真经传》", text: "方向：士人老学，兼具义理、政治和文章化解释，和纯道教修炼式注解有所不同。｜内容：读《老子》不专走内丹或神仙路线，而关心君臣治道、处世修身、保真守朴等议题；他常把清静无为理解为政治和人格上的克制。｜影响：说明唐代老学不是只有道士和帝王注，文人士大夫也在用《老子》讨论现实政治、士人修养和文章义理。" },
      { name: "杜光庭", era: "唐末五代道士", work: "《道德真经广圣义》", text: "方向：道教义疏体，系统解释唐玄宗御注传统，属于大型、铺陈、讲章式的道教老学。｜内容：广引经史和道教典籍，对章句逐层铺陈，常把经文解释为宇宙生成、圣王治世、修道阶次和教理依据；它会把一个词放进道教宇宙论、修持论和政治论里反复申说。｜影响：是唐宋道教老学的重要大型注疏，能看出道教内部如何把《道德经》组织成完整教义体系，也能补足王弼式哲学读法之外的宗教经典面貌。" },
      { name: "陈景元", era: "北宋道士", work: "《道德真经藏室纂微篇》《南华真经章句音义》", text: "方向：宋代道教老庄学，兼重义理、音义和经典整理，是道教内部读老庄的重要学者型人物。｜内容：讲《老子》时重玄微义理与修道工夫，把清静、无为、守一等语汇放入道教修持；讲《庄子》时又注意章句、音义和道教化理解。｜影响：显示宋代道教并不只是斋醮仪式，也持续进行文献整理和哲学解释，是唐代重玄学与宋元内丹学之间的重要桥梁。" },
      { name: "王安石", era: "北宋", work: "《老子注》相关老学", text: "方向：政治家、经学家读《老子》，重经世、制度和治术，而不把《老子》只当隐逸清谈。｜内容：关注名实、权变、君道、法度和制度运行，把“无为”解释成不以私意扰乱公共秩序，而不是消极不治。｜影响：代表北宋新学语境中的老学，说明《老子》可以被纳入政治改革、国家治理和儒家经世理论的讨论。" },
      { name: "吕惠卿", era: "北宋", work: "《道德真经传》《庄子义》", text: "方向：兼注老庄的士大夫义理学，常把道家文本放入北宋新学和政治思想中理解。｜内容：讲《老子》时重道体、治心、政治秩序；讲《庄子》时常把寓言归入义理脉络，使文章、修养、治道相连，而不是只欣赏奇谈。｜影响：其说被宋元庄学汇编保存，说明北宋文人不只读儒经，也用老庄构建自己的心性论、政治论和文章解释法。" },
      { name: "苏辙", era: "北宋", work: "《老子解》", text: "方向：儒者读《老》，平实而重治心，不把《老子》完全神秘化。｜内容：常把经文解释为去欲、守静、知止、柔弱胜刚强，以及君主如何不逞私智、不扰民、不以机巧坏天下。｜影响：适合与王弼、河上公互参：王弼偏本体义理，河上公偏养生治国，苏辙则提供宋代士人修身经世的中间读法。" },
      { name: "宋徽宗赵佶", era: "北宋", work: "《御解道德真经》", text: "方向：帝王道教化的老学解释，和唐玄宗御注同属皇权参与经典解释的传统。｜内容：以崇道政治和国家礼制为背景，强调道德、清静、圣治、君主修养，使《老子》成为王朝文化权威的一部分。｜影响：其意义不只在注文本身，还在于反映宋代国家道教、皇权崇道、经典解释和政治合法性之间的关系。" },
      { name: "林希逸", era: "南宋", work: "《老子口义》《庄子口义》", text: "方向：口义体，面向讲学和初学者，重通俗说明和章旨贯通。｜内容：解释老庄时常先疏通一章大意，再说明句意和寓言旨趣，不故作玄奥；尤其能把难懂的庄子故事转成可理解的义理脉络。｜影响：使老庄进入更广泛的士人教育和文章阅读传统，对后世普及型注本、讲义式读法和文学化读庄影响很大。" },
      { name: "褚伯秀", era: "南宋", work: "《南华真经义海纂微》", text: "方向：汇编型庄学，收集宋以前多家解释，不以一家之说压倒众说。｜内容：保存王雱、吕惠卿、陈景元、林希逸等人的庄子说法，让读者在同一处看到义理、道教、士人讲学等不同路线。｜影响：它像一部宋代庄学资料库，对研究宋代三教会通、士人庄学、道教庄学和后世《庄子》接受史都很重要。" },
      { name: "范应元、董思靖", era: "宋元道教", work: "《老子道德经古本集注》等", text: "方向：古本、集注与道教义理解经。｜内容：重视不同底本和诸家注，把文字校勘、章句解释、道教修持并置，常以“古本”意识修正通行读法。｜影响：为后人比较《老子》版本和注家系统提供材料，也说明宋元道教很重视文献整理。" },
      { name: "白玉蟾", era: "南宋内丹家", work: "《道德宝章》", text: "方向：内丹道教读《老子》，重性命工夫和身心实践。｜内容：把虚静、谷神、玄牝、归根、抱一等章句落实到神气、性命、身心收摄和修炼火候，语言常带内丹术语。｜影响：代表宋元以后内丹学吸收《道德经》的方向，对后世道教修炼型老学影响深，也让《老子》成为内丹理论的重要经典来源。" },
      { name: "李道纯", era: "元代内丹家", work: "内丹与老庄会通著述", text: "方向：以内丹性命学会通老庄。｜内容：重中和、守中、性命双修，把“无为”“虚静”“归根”解释为身心修炼的层次和火候。｜影响：推动老庄语言成为内丹理论的核心表达，使《老子》不只是哲学文本，也成为修炼路线图。" },
      { name: "吴澄", era: "元代", work: "《道德真经注》", text: "方向：理学家和经学家整理《老子》。｜内容：重章句、名义和儒道会通，既不完全道教化，也不完全玄学化，而是把《老子》安置在理学知识结构中。｜影响：代表元代士人老学，让《道德经》继续参与儒道关系、心性修养和经典解释的讨论。" },
      { name: "陆西星", era: "明代道教", work: "《南华真经副墨》", text: "方向：明代道教和三教会通读庄，重在从寓言中读出修道工夫。｜内容：常把庄子寓言解释为修心、炼性、忘机、超脱形累的过程，不只讨论字句，也把故事当作内在体验的象征。｜影响：使《庄子》与内丹、心性、三教会通发生更紧密关系，是明代道教庄学的重要代表，也影响后世修行化读庄。" },
      { name: "焦竑", era: "明代", work: "《庄子翼》《老子翼》", text: "方向：汇集异说、辅助读者旁通诸家。｜内容：不只是逐句注释，而是把前人说法、儒释道相关材料、文献考辨汇在一起，帮助读者扩展解释视野。｜影响：体现晚明开放的学术风气，使老庄成为三教比较、文章评点和思想会通的共同材料。" },
      { name: "释德清", era: "明代高僧", work: "《老子道德经解》《庄子内篇注》", text: "方向：以佛教尤其禅学眼光读老庄。｜内容：常把无为、忘我、齐物、逍遥解释为破除妄执、返照心性、超越分别的工夫，重在心地体验而非章句考据。｜影响：代表明清三教会通的重要路线，影响后来把庄子与禅宗互相发明的读法。" },
      { name: "方以智", era: "明末清初", work: "《药地炮庄》", text: "方向：晚明清初的创造性庄学，兼具考据、哲学和知识论。｜内容：读《庄子》时常联系名理、物理、心性和语言问题，不满足于传统玄学套语。｜影响：显示庄子思想可以进入更广阔的知识世界，是明清之际思想转型中的重要庄学文本。" },
      { name: "王夫之", era: "明末清初", work: "《老子衍》《庄子解》", text: "方向：批判性吸收老庄，以气化、历史和现实关怀重读。｜内容：他不轻易接受虚无化、逃世化读法，而常从生命实践、政治现实、气化流行解释老庄。｜影响：使老庄不只是玄远清谈，也进入明清思想家关于历史、现实和主体精神的深层辩论。" },
      { name: "宣颖、胡文英", era: "清代", work: "《南华经解》《庄子独见》", text: "方向：个人义理解读和文章脉络分析。｜内容：重章旨、文势、寓言用意和精神境界，不只做校勘，也努力读出每篇内部的思想结构。｜影响：清代庄学除考据集释外，还有这类偏义理和文学阅读的传统，能补充纯校勘读法的不足。" },
      { name: "郭庆藩", era: "清代", work: "《庄子集释》", text: "方向：集大成式校勘注疏。｜内容：汇合郭象注、成玄英疏、陆德明音义，并吸收清代校勘训诂成果，按原文逐条罗列材料。｜影响：现代读《庄子》最常用的资料库之一，优点是材料全、出处多，适合校字、辨义、追踪注疏传统。" },
      { name: "王先谦", era: "清末", work: "《庄子集解》", text: "方向：较简明的集解本。｜内容：取材于旧注、清代考证和个人判断，比《集释》更便于快速阅读，但材料密度略低。｜影响：适合初学者和研究者快速把握诸家大意，与郭庆藩《集释》可以互补。" },
      { name: "魏源、严复", era: "晚清近代", work: "《老子本义》、老学评点与近代阐释", text: "方向：把《老子》放进经世、变法和中西思想比较中。｜内容：魏源重本义和经世关怀，严复则常以近代政治、社会、自由和进化论语境评点老学。｜影响：老庄由传统经学、道教、玄学文本，进一步进入近代思想转型和中西比较的讨论。" },
      { name: "刘文典、马叙伦", era: "现代", work: "《庄子补正》及老庄校读", text: "方向：现代文献学、校勘和训诂。｜内容：刘文典治《庄子》重文字校释、旧注辨析和材料考订；马叙伦等人推动《老子》《庄子》在现代学术规范下重新整理。｜影响：他们把传统注疏推进到现代学术研究，使读者更能区分文本问题、训诂问题和哲学阐释问题。" },
      { name: "朱谦之、高亨", era: "现代", work: "《老子校释》等", text: "方向：现代《老子》校勘、训诂和思想史研究。｜内容：重视版本差异、古文字、音韵、通假和章句结构，尤其在出土文献出现后更能显示校释方法的重要性。｜影响：为今天比较王弼本、河上公本、帛书本、楚简本等奠定现代研究基础。" },
      { name: "王叔岷", era: "现代", work: "《庄子校诠》", text: "方向：严密校勘和考辨型庄学。｜内容：广参古本、类书、旧注、训诂材料，对讹字、脱文、异文和旧说得失作细密判断。｜影响：适合深入研究者使用，能帮助读者从“意会庄子”进入“文本究竟怎么写、为什么这样读”的层面。" },
      { name: "陈可抒", era: "当代", work: "《游：庄子新注新解》《人生无意读庄子》", text: "方向：当代庄子新注新解，重心在《庄子》内篇七篇的重新句读、现代译文、章句注释和哲学阐释；它不是传统意义上的历代旧注，却代表近年面向普通读者而又重视文本依据的一路新解。｜内容：《游：庄子新注新解》据公开书目信息以上海涵芬楼《南华真经》为底本，强调重新句读、现代汉语译文、逐段论述和引证考辨；它的读法会把内篇看成一个有整体思辨结构的文本，而不是只摘取“逍遥”“齐物”“无用之用”等名句。陈可抒常注意庄子文章的转折、寓言的层级、概念在篇内如何推进，也会用今天读者更容易进入的语言解释玄远处。｜影响：它更接近当代公共阅读与学术普及之间的注解路线：比纯白话赏读更重文本依据和章句脉络，比传统集释更照顾现代读者的阅读节奏。放在源流里，适合提示读者：现代庄学不只有陈鼓应式系统注译，也有尝试重排句读、重建论证、以现代哲学问题意识读庄的新一路。" },
      { name: "陈鼓应", era: "现代", work: "《老子今注今译》《庄子今注今译》", text: "方向：现代汉语注译和哲学阐释。｜内容：在保留文献注释的基础上，用现代语言解释道、无为、自然、齐物、逍遥等核心概念，并提供较通达的白话译文。｜影响：影响普通读者和大学课堂很大，使老庄从专家校勘书走向现代公共阅读和哲学讨论。" },
    ],
    sources: [
      ["《老子》版本说略", "https://www.chinawriter.com.cn/n1/2018/0222/c404063-29829128.html"],
      ["历代《庄子》研究举隅", "https://epaper.gmw.cn/zhdsb/html/2017-10/11/nw.D110000zhdsb_20171011_1-15.htm"],
      ["维基文库《南华真经注疏》", "https://zh.wikisource.org/wiki/%E5%8D%97%E8%8F%AF%E7%9C%9F%E7%B6%93%E8%A8%BB%E7%96%8F"],
      ["中国哲学书电子化计划《南华真经注疏》", "https://ctext.org/wiki.pl?if=gb&remap=gb&res=832812"],
      ["得到《游：庄子新注新解》", "https://www.dedao.cn/ebook/detail?id=OAdXprx6N41dm9BQkayr8z7OqLGoE3lzqZZ0YMlVAnxRZXK2Dg5pbevPJjjnQv2e"],
    ],
  };

  function esc(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function jsArg(value) {
    return esc(JSON.stringify(String(value ?? "")));
  }

  async function json(url) {
    const versionedUrl = url + (url.includes("?") ? "&" : "?") + "v=" + DATA_VERSION;
    const res = await fetch(versionedUrl, { cache: "force-cache" });
    if (!res.ok) throw new Error("load failed: " + url);
    return res.json();
  }

  async function bootData() {
    if (APP_INDEX) return;
    [APP_INDEX, QUOTES] = await Promise.all([json("data/index.json"), json("data/quotes.json")]);
  }

  async function ensureDDJIndex() {
    await bootData();
    if (DDJ_META && DDJ_INDEX) return;
    [DDJ_META, DDJ_INDEX] = await Promise.all([json("data/ddj/meta.json"), json("data/ddj/index.json")]);
  }

  async function ensureDDJChapter(n) {
    await ensureDDJIndex();
    if (!ddjCache.has(n)) ddjCache.set(n, await json("data/ddj/" + String(n).padStart(2, "0") + ".json"));
    return ddjCache.get(n);
  }

  async function ensureZZIndex() {
    await bootData();
    if (ZZ_META && ZZ_INDEX) return;
    [ZZ_META, ZZ_INDEX] = await Promise.all([json("data/zhuangzi/meta.json"), json("data/zhuangzi/index.json")]);
  }

  function zzItem(groupName, index) {
    const group = (ZZ_INDEX || []).find((g) => g.name === groupName);
    return group?.chs?.[index] || null;
  }

  async function ensureZZChapter(groupName, index) {
    await ensureZZIndex();
    const item = zzItem(groupName, index);
    if (!item) return null;
    if (!zzCache.has(item.slug)) zzCache.set(item.slug, await json("data/zhuangzi/" + item.slug + ".json"));
    return zzCache.get(item.slug);
  }

  async function ensureConcepts() {
    if (!CONCEPTS) CONCEPTS = await json("data/concepts.json");
  }

  async function ensureSearchCorpus() {
    if (searchReady) return;
    await Promise.all([ensureDDJIndex(), ensureZZIndex(), ensureConcepts()]);
    await Promise.all(DDJ_INDEX.map((c) => ensureDDJChapter(c.n)));
    const zItems = ZZ_INDEX.flatMap((g) => g.chs.map((c) => [g.name, c.index]));
    await Promise.all(zItems.map(([g, i]) => ensureZZChapter(g, i)));
    searchReady = true;
  }

  function icon(name) {
    const paths = {
      back: '<path d="M15 18 9 12l6-6"/>',
      chevron: '<path d="m9 18 6-6-6-6"/>',
    };
    return '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">' + (paths[name] || "") + "</svg>";
  }

  function options(list, selected) {
    return (list || []).map((v) => '<option value="' + esc(v) + '"' + (v === selected ? " selected" : "") + ">" + esc(v) + "</option>").join("");
  }

  function modeLabel(mode) {
    return mode === "text" ? "原文" : mode === "translation" ? "原文+译文" : mode === "note" ? "原文+注疏" : "全部";
  }
  function modeValue(label) {
    return label === "原文" ? "text" : label === "原文+译文" ? "translation" : label === "原文+注疏" ? "note" : "all";
  }
  function sizeLabel(size) {
    return size === "small" ? "小" : size === "large" ? "大" : "中";
  }
  function sizeValue(label) {
    return label === "小" ? "small" : label === "大" ? "large" : "normal";
  }

  function getDDJVer() {
    const versions = DDJ_META?.versions || [];
    return versions.includes(curVer) ? curVer : versions[0] || "王弼本";
  }

  function ddjHasNotes() {
    return getDDJVer() === "王弼本";
  }

  function readerSettings(allowNotes = true) {
    const modeControl = allowNotes
      ? '<label><span>显示</span><select class="vs" onchange="app.setReaderMode(this.value)">' +
        options(["全部", "原文", "原文+译文", "原文+注疏"], modeLabel(readerMode)) +
        "</select></label>"
      : "";
    const foldControl = allowNotes
      ? '<label class="check-tool"><input type="checkbox" onchange="app.setNoteFold(this.checked)"' +
        (noteFold ? " checked" : "") +
        "><span>折叠注疏</span></label>"
      : "";
    return (
      modeControl +
      '<label><span>字号</span><select class="vs" onchange="app.setReaderSize(this.value)">' +
      options(["小", "中", "大"], sizeLabel(readerSize)) +
      "</select></label>" +
      foldControl
    );
  }

  function sourceNote(name) {
    return DDJ_META?.sources?.[name] ? '<div class="source-note">' + esc(DDJ_META.sources[name]) + "</div>" : "";
  }

  function zzSourceNote(name) {
    return ZZ_META?.noteSources?.[name] ? '<div class="source-note">' + esc(ZZ_META.noteSources[name]) + "</div>" : "";
  }

  function getDDJTr() {
    return DDJ_META?.translators?.includes(curTr) ? curTr : DDJ_META?.translators?.[0] || "河上公注";
  }

  function getZZTr() {
    return ZZ_META?.translators?.includes(curTr) ? curTr : ZZ_META?.translators?.[0] || "郭象注";
  }

  function loading(text) {
    $("#app").innerHTML = '<div class="page"><p class="no-res">' + esc(text || "载入中") + "</p></div>";
  }

  function setActiveTab(nextTab) {
    tab = nextTab;
    const visibleTab = nextTab === "search" ? "home" : nextTab;
    $$(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === visibleTab));
  }

  function home() {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)] || { t: "道可道，非常道", s: "《道德经》第一章" };
    const quoteClick = q.k === "zz" ? "app.openQuote('zz'," + Number(q.i || 0) + "," + jsArg(q.g || "内篇") + ")" : "app.openQuote('ddj'," + Number(q.n || 1) + ")";
    const stats = [
      ["道德经", (APP_INDEX?.ddj?.versions?.length || 4) + " 个版本 · 81 章", "ddj"],
      ["庄子", "33 篇 · 逐段注疏", "zz"],
      ["玄理", (APP_INDEX?.conceptCount || 0) + " 个主题", "concepts"],
      ["源流", "各版原文 · 历代注疏", "lineage"],
    ];
    return (
      '<div class="page home-page"><section class="hero-section">' +
      '<div class="brand-mark" aria-hidden="true"><svg viewBox="0 0 96 96"><defs><clipPath id="taiji-home"><circle cx="48" cy="48" r="38"/></clipPath></defs><g clip-path="url(#taiji-home)"><rect x="10" y="10" width="38" height="76" fill="#fffdf8"/><rect x="48" y="10" width="38" height="76" fill="#25221d"/><circle cx="48" cy="29" r="19" fill="#fffdf8"/><circle cx="48" cy="67" r="19" fill="#25221d"/><circle cx="48" cy="29" r="7" fill="#25221d"/><circle cx="48" cy="67" r="7" fill="#fffdf8"/></g><circle cx="48" cy="48" r="38" fill="none" stroke="#25221d" stroke-width="4"/></svg></div>' +
      '<h1 class="app-title">老庄</h1><p class="app-subtitle">道可道，非常道</p></section>' +
      '<button type="button" class="daily-card" onclick="' + quoteClick + '"><div class="daily-label">灵犀一指</div><div class="daily-text">' +
      esc(q.t) +
      '</div><div class="daily-source">' +
      esc(q.s) +
      "</div></button>" +
      '<section class="stat-strip">' +
      stats.map((s) => '<button type="button" onclick="app.go(\'' + esc(s[2]) + '\')"><strong>' + esc(s[0]) + "</strong><span>" + esc(s[1]) + "</span></button>").join("") +
      "</section>" +
      '<section class="home-search-entry"><button type="button" onclick="app.go(\'search\')"><span class="home-search-icon"><svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.7" cy="10.7" r="6.2"/><path d="M10.7 6.8a3.9 3.9 0 0 1 3.9 3.9"/><path d="m15.2 15.2 4.4 4.4"/><path d="M5.4 17.3c2.2 1.1 4.6 1.2 7.1.4"/></svg></span><strong>搜索</strong><span>检索原文、注疏、译文与玄理</span></button></section></div>'
    );
  }

  function rLineage() {
    const versionLinks = LINEAGE.versions.map((item, i) => '<a href="#version-' + i + '">' + esc(item.title) + "</a>").join("");
    const figureLinks = LINEAGE.figures.map((item, i) => '<a href="#figure-' + i + '">' + esc(item.name) + "</a>").join("");
    return (
      '<div class="page lineage-page"><div class="page-head"><div><h2 class="page-title">老庄源流</h2><p class="page-sub">原文版本、注疏人物与历史影响</p></div></div>' +
      '<section class="lineage-section lineage-toc"><h3 class="section-title">目录总览</h3><div class="toc-grid"><div><h4>各版原文</h4><div class="toc-links">' +
      versionLinks +
      '</div></div><div><h4>历代注疏人物</h4><div class="toc-links compact">' +
      figureLinks +
      "</div></div></div></section>" +
      '<section class="lineage-section"><h3 class="section-title">阅读提示</h3><div class="lineage-note">' +
      "<p>读老庄先分清两件事：一是“原文版本”，二是“注疏传统”。原文版本解决的是这句话原来可能怎样写、各本哪里不同；注疏传统解决的是历代读者怎样理解它、为什么会读出治国、养生、玄学、内丹、禅学、校勘等不同方向。</p>" +
      "<p>如果你初读，可先用通行本建立整体印象：《道德经》先读王弼本或通行八十一章，《庄子》先读内篇七篇。等大意通了，再看帛书、楚简等可靠来源较清楚的异文本。站内“竹简参考本”目前只作异文参考，不等同于已核定的北大汉简或某一公布西汉竹书转录本。</p>" +
      "<p>如果你重义理，可重点看王弼、郭象、成玄英：王弼讲“无”和本体，郭象讲独化与适性，成玄英讲重玄与遣执。三者构成魏晋到唐代老庄玄学、道教哲学的主轴。</p>" +
      "<p>如果你重道教修持，可看河上公、想尔注、杜光庭、陈景元、白玉蟾、李道纯、黄元吉等一路：他们会把“道”“无为”“抱一”“谷神”“玄牝”等读成治身、守气、内丹、性命工夫。</p>" +
      "<p>如果你重文献可靠性，可优先看陆德明音义、郭庆藩《庄子集释》、王先谦《庄子集解》、王叔岷《庄子校诠》，以及现代《老子》校释。它们帮助你判断异文、通假、讹脱和旧注根据。</p>" +
      "</div></section>" +
      '<section class="lineage-section"><h3 class="section-title">原文版本源流</h3><div class="lineage-grid">' +
      LINEAGE.versions.map((item, i) => '<article class="lineage-card" id="version-' + i + '"><div class="lineage-num">' + String(i + 1).padStart(2, "0") + '</div><h4>' + esc(item.title) + "</h4><p>" + esc(item.text) + "</p></article>").join("") +
      '</div></section><section class="lineage-section"><h3 class="section-title">历代注疏人物</h3><div class="figure-list">' +
      LINEAGE.figures.map((item, i) => '<details class="figure-row" id="figure-' + i + '"><summary><div><strong>' + esc(item.name) + '</strong><span>' + esc(item.era) + " · " + esc(item.work) + '</span></div><em>展开</em></summary><div class="figure-copy">' + item.text.split("｜").map((line) => "<p>" + esc(line) + "</p>").join("") + "</div></details>").join("") +
      "</div></section>" +
      '<section class="lineage-section"><h3 class="section-title">资料线索</h3><div class="source-links">' +
      LINEAGE.sources.map((s) => '<a href="' + esc(s[1]) + '" target="_blank" rel="noopener noreferrer">' + esc(s[0]) + "</a>").join("") +
      "</div></section></div>"
    );
  }

  function readerTools(kind) {
    if (kind === "ddj") {
      const hasNotes = ddjHasNotes();
      const ddjVer = getDDJVer();
      return (
        '<div class="reader-tools"><label><span>版本</span><select class="vs" onchange="app.setVer(this.value)">' +
        options(DDJ_META?.versions || [], ddjVer) +
        "</select></label>" +
        (hasNotes
          ? '<label><span>注译</span><select class="vs" onchange="app.setTr(this.value)">' +
            options(DDJ_META?.translators || [], getDDJTr()) +
            "</select></label>"
          : "") +
        readerSettings(hasNotes) +
        "</div>"
      );
    }
    return (
      '<div class="reader-tools"><label><span>注疏</span><select class="vs" onchange="app.setTr(this.value)">' +
      options(ZZ_META?.translators || [], getZZTr()) +
      "</select></label>" +
      readerSettings(true) +
      "</div>"
    );
  }

  function chapterRow(label, preview, onClick, meta) {
    return '<button class="chapter-item' + (meta ? "" : " no-meta") + '" onclick="' + onClick + '"><span class="ch-num">' + esc(label) + '</span><span class="ch-preview">' + esc(preview) + '</span><span class="row-go">' + icon("chevron") + "</span>" + (meta ? '<span class="ch-meta">' + esc(meta) + "</span>" : "") + "</button>";
  }

  async function rDDJ() {
    await ensureDDJIndex();
    curVer = getDDJVer();
    const available = DDJ_INDEX.filter((c) => c.versions.includes(curVer));
    const label = curVer === "王弼本" || curVer === "帛书本" ? "八十一章" : available.length + "章";
    let out = '<div class="page list-page"><div class="page-head"><div><h2 class="page-title">道德经</h2><p class="page-sub">' + esc(label) + " · " + esc(curVer) + "</p></div></div>" + readerTools("ddj") + '<div class="chapter-list">';
    available.forEach((c) => {
      const preview = c.previews?.[curVer] || c.preview || "";
      out += chapterRow("第" + c.n + "章", preview + (preview.length >= 60 ? "..." : ""), "app.sDDJ(" + c.n + ")");
    });
    return out + "</div></div>";
  }

  async function rZZ() {
    await ensureZZIndex();
    let out = '<div class="page list-page"><div class="page-head"><div><h2 class="page-title">庄子</h2><p class="page-sub">全本三十三篇 · 原文逐段对照郭象注、成玄英疏</p></div></div>' + readerTools("zz");
    ZZ_INDEX.forEach((g) => {
      out += '<section class="zz-group"><h3 class="section-title">' + esc(g.name) + "</h3>";
      g.chs.forEach((c) => {
        out += chapterRow(c.title, (c.preview || "").slice(0, 34) + "...", "app.sZZ(" + c.index + "," + jsArg(g.name) + ")", c.passageCount ? c.passageCount + "段" : "");
      });
      out += "</section>";
    });
    return out + "</div>";
  }

  async function rConcepts() {
    await ensureConcepts();
    const cats = ["全部", ...Array.from(new Set(CONCEPTS.map((c) => c.cat || "未分组")))];
    const counts = CONCEPTS.reduce((acc, c) => {
      const cat = c.cat || "未分组";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, { 全部: CONCEPTS.length });
    const q = conceptQuery.trim();
    const items = CONCEPTS.filter((c) => (curConceptCat === "全部" || (c.cat || "未分组") === curConceptCat) && (!q || c.t.includes(q) || c.d.includes(q) || (c.cat || "").includes(q)));
    let out = '<div class="page concepts-page"><div class="page-head"><div><h2 class="page-title">玄理</h2><p class="page-sub">老子义理、庄子思想与人物索引</p></div></div><div class="concept-search"><input type="search" value="' + esc(conceptQuery) + '" placeholder="筛选玄理、人物、寓言" aria-label="筛选玄理" oninput="app.setConceptQuery(this.value)"><span>' + items.length + " / " + CONCEPTS.length + '</span></div><div class="segmented">';
    cats.forEach((cat) => {
      out += '<button class="' + (cat === curConceptCat ? "active" : "") + '" onclick="app.setConceptCat(' + jsArg(cat) + ')"><span>' + esc(cat) + '</span><small>' + (counts[cat] || 0) + "</small></button>";
    });
    out += '</div><div class="concept-grid">';
    items.forEach((c) => {
      out += '<button class="concept-card" type="button" onclick="app.sConcept(' + jsArg(c.t) + ')"><div class="concept-cat">' + esc(c.cat || "") + "</div><h3>" + esc(c.t) + "</h3><p>" + esc(c.d) + "</p></button>";
    });
    if (!items.length) out += '<p class="no-res">未找到相关玄理</p>';
    return out + "</div></div>";
  }

  function rSearch() {
    return '<div class="page search-page"><div class="page-head"><div><h2 class="page-title">搜索</h2><p class="page-sub">检索原文、注疏、译文与玄理</p></div></div><div class="search-box"><input type="search" id="si" placeholder="输入关键词" oninput="app.srch(this.value)"></div><div id="sr"></div></div>';
  }

  function conceptTerms(concept) {
    const title = concept.t.replace(/[《》：:]/g, "").replace(/主题$/, "");
    const terms = [concept.t, title];
    const hits = concept.d.match(/[一-龥]{2,6}/g) || [];
    hits.slice(0, 8).forEach((term) => {
      if (!terms.includes(term) && !["不是", "说明", "庄子", "老子", "强调", "一个"].includes(term)) terms.push(term);
    });
    return terms.filter((x) => x && x.length >= 2);
  }

  async function relatedForConcept(concept) {
    await ensureSearchCorpus();
    const terms = conceptTerms(concept);
    const rows = [];
    function score(text) {
      return terms.reduce((sum, term, i) => sum + (text.includes(term) ? Math.max(1, 8 - i) : 0), 0);
    }
    DDJ_INDEX.forEach((idx) => {
      const c = ddjCache.get(idx.n);
      const text = Object.values(c.txt || {}).join("\n") + "\n" + Object.values(c.nt || {}).join("\n");
      const s = score(text);
      if (s > 0) rows.push({ kind: "道德经", score: s, title: "《道德经》第" + c.n + "章", snippet: (c.txt["王弼本"] || Object.values(c.txt).find(Boolean) || "").slice(0, 42), go: () => sDDJ(c.n) });
    });
    ZZ_INDEX.forEach((g) => {
      g.chs.forEach((idx) => {
        const c = zzCache.get(idx.slug);
        const text = (c.title || "") + "\n" + (c.txt || "") + "\n" + (c.passages || []).map((p) => [p.text, ...Object.values(p.tr || {}), ...Object.values(p.nt || {})].join("\n")).join("\n");
        const s = score(text);
        if (s > 0) rows.push({ kind: "庄子", score: s, title: "《庄子·" + c.title + "》", snippet: (c.txt || "").slice(0, 42), go: () => sZZ(idx.index, g.name) });
      });
    });
    const seen = new Set();
    return rows.sort((a, b) => b.score - a.score).filter((r) => !seen.has(r.title) && seen.add(r.title)).slice(0, 10);
  }

  async function sConcept(title) {
    curConceptTitle = title;
    await ensureConcepts();
    const concept = CONCEPTS.find((c) => c.t === title);
    if (!concept) return;
    $("#app").innerHTML =
      '<div class="page concept-detail"><div class="top-row"><button class="back-btn" onclick="app.go(\'concepts\')">' +
      icon("back") +
      '<span>返回</span></button></div><article class="reader-shell"><header class="reader-head"><div class="kicker">' +
      esc(concept.cat || "玄理") +
      '</div><h2 class="detail-title">' +
      esc(concept.t) +
      "</h2></header><p class=\"detail-text\">" +
      esc(concept.d) +
      '</p><section class="related-panel"><div class="panel-label">相关章节</div><div id="conceptRelated"><p class="source-note">正在按需检索相关原文与注疏...</p></div></section></article></div>';
    window.scrollTo(0, 0);
    const related = await relatedForConcept(concept);
    const box = $("#conceptRelated");
    if (!box) return;
    box.innerHTML = related.length
      ? '<div class="related-list">' + related.map((r, i) => '<button class="sr-item" data-rel="' + i + '"><span class="sr-title">' + esc(r.title) + '</span><span class="sr-snippet">' + esc(r.kind + " · " + r.snippet) + "...</span></button>").join("") + "</div>"
      : '<p class="source-note">暂未自动匹配到相关章节，可到搜索页全文检索。</p>';
    searchData = related.map((r) => ({ g: r.go }));
  }

  function splitPars(text, n) {
    const sents = (text || "").match(/[^。？！；]+[。？！；]?/g) || [text || ""];
    const out = [];
    for (let i = 0; i < sents.length; i += n || 3) out.push(sents.slice(i, i + (n || 3)).join(""));
    return out.filter((x) => x.trim());
  }
  function noteLines(note) {
    return (note || "").split("\n").map((l) => l.trim()).filter(Boolean);
  }
  function renderTextPars(text) {
    return splitPars(text, 3).map((p) => '<p class="detail-text">' + esc(p) + "</p>").join("");
  }
  function commentatorCard(name) {
    const info = COMMENTATORS[name];
    if (!info) return "";
    return '<aside class="commentator-card"><div><strong>' + esc(info.title) + "</strong><span>" + esc(info.meta) + "</span></div><p>" + esc(info.text) + "</p></aside>";
  }
  function foldCard(cls, head, body) {
    return '<details class="' + cls + '"' + (noteFold ? "" : " open") + "><summary>" + head + "</summary>" + body + "</details>";
  }
  function renderChapterNote(note, name) {
    if (!note.trim()) return '<div class="empty-note"><strong>' + esc(name) + '</strong><p>当前章节尚未接入完整正文。为避免错配，暂不显示占位注释。</p></div>';
    const lines = noteLines(note);
    const title = lines[0]?.startsWith("【") ? lines.shift() : name;
    return foldCard("annot-card", '<span class="annot-hd">' + esc(title.replace(/[【】]/g, "")) + "<span>" + esc(name) + "</span></span>", sourceNote(name) + zzSourceNote(name) + '<div class="annot-bd">' + lines.map((l) => '<p class="annot-line">' + esc(l) + "</p>").join("") + "</div>");
  }
  function renderAppendixNote(note, name) {
    if (!note.trim()) return "";
    const lines = noteLines(note);
    if (lines[0]?.startsWith("【")) lines.shift();
    return (
      '<details class="annot-card appendix-note"><summary><span class="annot-hd">完整集释备查<span>' +
      esc(name) +
      "</span></span></summary>" +
      zzSourceNote(name) +
      '<div class="annot-bd">' +
      lines.map((l) => '<p class="annot-line">' + esc(l) + "</p>").join("") +
      "</div></details>"
    );
  }

  async function sDDJ(n) {
    setActiveTab("ddj");
    curZZGrp = "";
    await ensureDDJIndex();
    curVer = getDDJVer();
    const availableNums = DDJ_INDEX.filter((x) => x.versions.includes(curVer)).map((x) => x.n);
    const targetN = availableNums.includes(n) ? n : availableNums[0];
    if (!targetN) return;
    curDDJCh = targetN;
    const c = await ensureDDJChapter(targetN);
    if (!c) return;
    const pos = availableNums.indexOf(targetN);
    const prev = pos > 0 ? availableNums[pos - 1] : null;
    const next = pos >= 0 && pos < availableNums.length - 1 ? availableNums[pos + 1] : null;
    const txt = c.txt[curVer] || "";
    const hasNotes = ddjHasNotes();
    const ddjTr = hasNotes ? getDDJTr() : "";
    if (hasNotes && curTr !== ddjTr) curTr = ddjTr;
    const noteName = hasNotes && readerMode === "translation" ? "通用白话译文" : ddjTr;
    const nt = hasNotes && readerMode !== "text" ? c.nt?.[noteName] || "" : "";
    $("#app").innerHTML =
      '<div class="page detail-page"><div class="top-row"><button class="back-btn" onclick="app.go(\'ddj\')">' +
      icon("back") +
      "<span>返回</span></button>" +
      readerTools("ddj") +
      '</div><article class="reader-shell reader-size-' +
      esc(readerSize) +
      '"><header class="reader-head"><div class="kicker">道德经 · ' +
      esc(curVer) +
      '</div><h2 class="detail-title">第' +
      targetN +
      "章</h2>" +
      (!hasNotes || readerMode === "text" ? "" : commentatorCard(noteName)) +
      '</header><section class="original-panel"><div class="panel-label">原文</div>' +
      renderTextPars(txt) +
      "</section>" +
      (!hasNotes || readerMode === "text" ? "" : renderChapterNote(nt, noteName)) +
      '<nav class="chapter-nav" aria-label="章节切换"><button ' +
      (prev ? 'onclick="app.sDDJ(' + prev + ')"' : "disabled") +
      ">上一章</button><button " +
      (next ? 'onclick="app.sDDJ(' + next + ')"' : "disabled") +
      ">下一章</button></nav></article></div>";
    window.scrollTo(0, 0);
  }

  function renderInlineNote(p, i, trName, grouped) {
    const note = (p.nt?.[trName] || "").trim();
    if (!note || !(readerMode === "all" || readerMode === "note")) return "";
    const head = grouped ? "第" + (i + 1) + "段 · " + trName : trName;
    return foldCard("annot-card inline", '<span class="annot-hd">' + esc(head) + "</span>", '<div class="annot-bd">' + noteLines(note).map((l) => '<p class="annot-line">' + esc(l) + "</p>").join("") + "</div>");
  }
  function renderPassages(chapter, trName) {
    const passages = chapter.passages || [];
    const transName = ZZ_META?.translationName || "通用白话译文";
    let out = "";
    passages.forEach((p, i) => {
      const translation = (p.tr?.[transName] || "").trim();
      out += '<section class="passage-block" id="p' + (i + 1) + '"><div class="passage-num">' + (i + 1) + '</div><p class="detail-text passage">' + esc(p.text) + "</p>";
      if (translation && (readerMode === "all" || readerMode === "translation")) out += '<div class="translation-card"><div class="translation-hd">' + esc(transName) + '</div><div class="translation-bd">' + esc(translation) + "</div></div>";
      out += renderInlineNote(p, i, trName, false);
      out += "</section>";
    });
    return out;
  }

  async function sZZ(ci, gn) {
    setActiveTab("zz");
    curDDJCh = null;
    curZZIdx = ci;
    curZZGrp = gn;
    const c = await ensureZZChapter(gn, ci);
    if (!c) return;
    const zzTr = getZZTr();
    if (curTr !== zzTr) curTr = zzTr;
    const profileName = readerMode === "translation" ? ZZ_META?.translationName || "通用白话译文" : zzTr;
    const content = c.passages?.length ? renderPassages(c, zzTr) : renderTextPars(c.txt || "");
    const chapterNote = c.chapterNotes?.[zzTr] || "";
    const hasInlineNote = !!c.passages?.some((p) => (p.nt?.[zzTr] || "").trim());
    const chapterNoteHtml = chapterNote && (readerMode === "all" || readerMode === "note") ? (hasInlineNote ? renderAppendixNote(chapterNote, zzTr) : renderChapterNote(chapterNote, zzTr)) : "";
    $("#app").innerHTML =
      '<div class="page detail-page"><div class="top-row"><button class="back-btn" onclick="app.go(\'zz\')">' +
      icon("back") +
      "<span>返回</span></button>" +
      readerTools("zz") +
      '</div><article class="reader-shell reader-size-' +
      esc(readerSize) +
      '"><header class="reader-head"><div class="kicker">庄子 · ' +
      esc(gn) +
      '</div><h2 class="detail-title">' +
      esc(c.title) +
      "</h2>" +
      (readerMode === "text" ? "" : commentatorCard(profileName)) +
      (ZZ_META?.translationSource && (readerMode === "all" || readerMode === "translation") ? '<div class="source-note">' + esc(ZZ_META.translationSource) + "</div>" : "") +
      "</header>" +
      content +
      chapterNoteHtml +
      "</article></div>";
    window.scrollTo(0, 0);
  }

  async function srch(q) {
    q = (q || "").trim();
    if (!q) {
      $("#sr").innerHTML = "";
      return;
    }
    $("#sr").innerHTML = '<p class="no-res">正在检索全文...</p>';
    await ensureSearchCorpus();
    const results = [];
    DDJ_INDEX.forEach((idx) => {
      const c = ddjCache.get(idx.n);
      Object.values(c.txt || {}).forEach((t) => t && t.includes(q) && results.push({ t: "《道德经》第" + c.n + "章", s: t.slice(0, 46), g: () => sDDJ(c.n) }));
      Object.entries(c.nt || {}).forEach(([k, v]) => v && v.includes(q) && results.push({ t: "第" + c.n + "章 · " + k, s: v.slice(0, 46), g: () => sDDJ(c.n) }));
    });
    ZZ_INDEX.forEach((g) => {
      g.chs.forEach((idx) => {
        const c = zzCache.get(idx.slug);
        if ((c.txt || "").includes(q)) results.push({ t: "《庄子·" + c.title + "》", s: c.txt.slice(0, 46), g: () => sZZ(idx.index, g.name) });
        (c.translationBlocks || []).forEach((b) => (b.text || "").includes(q) && results.push({ t: "《庄子·" + c.title + "》 · " + (b.name || "白话译文"), s: b.text.slice(0, 46), g: () => sZZ(idx.index, g.name) }));
        (c.passages || []).forEach((p) => {
          if ((p.text || "").includes(q)) results.push({ t: "《庄子·" + c.title + "》原文", s: p.text.slice(0, 46), g: () => sZZ(idx.index, g.name) });
          Object.entries(p.tr || {}).forEach(([k, v]) => v && v.includes(q) && results.push({ t: "《庄子·" + c.title + "》 · " + k, s: v.slice(0, 46), g: () => sZZ(idx.index, g.name) }));
          Object.entries(p.nt || {}).forEach(([k, v]) => v && v.includes(q) && results.push({ t: "《庄子·" + c.title + "》 · " + k, s: v.slice(0, 46), g: () => sZZ(idx.index, g.name) }));
        });
      });
    });
    CONCEPTS.forEach((c) => (c.t.includes(q) || c.d.includes(q) || (c.cat || "").includes(q)) && results.push({ t: "玄理：" + c.t, s: c.d.slice(0, 46), g: () => go("concepts") }));
    const seen = new Set();
    searchData = results.filter((r) => !seen.has(r.t + r.s) && seen.add(r.t + r.s)).slice(0, 40);
    $("#sr").innerHTML = searchData.length ? '<div id="sc">' + searchData.map((r, i) => '<button class="sr-item" data-si="' + i + '"><span class="sr-title">' + esc(r.t) + '</span><span class="sr-snippet">' + esc(r.s) + "...</span></button>").join("") + "</div>" : '<p class="no-res">未找到</p>';
  }

  async function go(t) {
    setActiveTab(t);
    if (t !== "ddj") curDDJCh = null;
    if (t !== "zz") curZZGrp = "";
    try {
      if (t === "home") {
        await bootData();
        $("#app").innerHTML = home();
      } else if (t === "ddj") {
        curDDJCh = null;
        loading("载入道德经目录...");
        $("#app").innerHTML = await rDDJ();
      } else if (t === "zz") {
        curZZGrp = "";
        loading("载入庄子目录...");
        $("#app").innerHTML = await rZZ();
      } else if (t === "concepts") {
        loading("载入玄理...");
        $("#app").innerHTML = await rConcepts();
      } else if (t === "lineage") {
        $("#app").innerHTML = rLineage();
      } else if (t === "search") {
        $("#app").innerHTML = rSearch();
        setTimeout(() => $("#si")?.focus(), 100);
      }
    } catch (err) {
      $("#app").innerHTML = '<p class="no-res">载入失败，请刷新重试。</p>';
      console.error(err);
    }
    window.scrollTo(0, 0);
  }

  function setVer(v) {
    curVer = v;
    localStorage.setItem("lz_ver", v);
    curDDJCh !== null ? sDDJ(curDDJCh) : go("ddj");
  }
  function openQuote(kind, a, b) {
    if (kind === "zz") {
      sZZ(Number(a) || 0, b || "内篇");
      return;
    }
    curVer = "王弼本";
    sDDJ(Number(a) || 1);
  }
  function setTr(t) {
    curTr = t;
    localStorage.setItem("lz_tr", t);
    if (tab === "ddj" && curDDJCh !== null) sDDJ(curDDJCh);
    else if (tab === "zz" && curZZGrp) sZZ(curZZIdx, curZZGrp);
    else go(tab);
  }
  function refreshReader() {
    if (tab === "ddj" && curDDJCh !== null) sDDJ(curDDJCh);
    else if (tab === "zz" && curZZGrp) sZZ(curZZIdx, curZZGrp);
  }
  function setReaderMode(label) {
    readerMode = modeValue(label);
    localStorage.setItem("lz_reader_mode", readerMode);
    refreshReader();
  }
  function setReaderSize(label) {
    readerSize = sizeValue(label);
    localStorage.setItem("lz_reader_size", readerSize);
    refreshReader();
  }
  function setNoteFold(value) {
    noteFold = !!value;
    localStorage.setItem("lz_note_fold", noteFold ? "1" : "0");
    refreshReader();
  }
  function setConceptCat(cat) {
    curConceptCat = cat;
    if (tab === "concepts") go("concepts");
  }
  function setConceptQuery(q) {
    conceptQuery = q || "";
    if (tab === "concepts") go("concepts").then(() => {
      const input = document.querySelector(".concept-search input");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  }
  function tDark() {
    document.body.classList.toggle("dark");
    localStorage.setItem("lz_dark", document.body.classList.contains("dark") ? "1" : "0");
  }
  function iDark() {
    if (localStorage.getItem("lz_dark") === "1") document.body.classList.add("dark");
  }

  document.addEventListener("click", function (e) {
    const el = e.target.closest(".sr-item");
    if (el && searchData[el.dataset.si]?.g) searchData[el.dataset.si].g();
    if (el && searchData[el.dataset.rel]?.g) searchData[el.dataset.rel].g();
  });

  window.app = { go, sDDJ, sZZ, sConcept, srch, openQuote, setVer, setTr, setReaderMode, setReaderSize, setNoteFold, setConceptCat, setConceptQuery, tDark };

  document.addEventListener("DOMContentLoaded", async () => {
    iDark();
    $$(".tab-btn").forEach((b) => b.addEventListener("click", () => go(b.dataset.tab)));
    $("#darkToggle")?.addEventListener("click", tDark);
    try {
      curVer = localStorage.getItem("lz_ver") || curVer;
      curTr = localStorage.getItem("lz_tr") || curTr;
      readerMode = localStorage.getItem("lz_reader_mode") || readerMode;
      readerSize = localStorage.getItem("lz_reader_size") || readerSize;
      const storedNoteFold = localStorage.getItem("lz_note_fold");
      if (storedNoteFold !== null) noteFold = storedNoteFold === "1";
    } catch (e) {}
    await go("home");
  });
})();
