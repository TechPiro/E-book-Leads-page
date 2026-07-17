import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

// Book Content Structure representing all 42 pages
const PAGES = [
  {
    page: 1,
    type: "cover",
    title: "The First Step\nto Becoming",
    subtitle: "Why You Feel Lost (And Where to Begin)",
    stats: [
      { num: "12", label: "SHORT, HONEST\nPARTS" },
      { num: "7", label: "DAYS TO SIMPLY\nBEGIN" },
      { num: "1", label: "QUESTION THAT\nCHANGES THE\nSEARCH" }
    ],
    capsule: "A COMPANION, NOT A MAP",
    footer: "Why You Feel Lost (And Where to Begin) • by Gbolahan Oyegoke"
  },
  {
    page: 2,
    type: "text",
    partHeader: "INTRODUCTION",
    chapterHeader: "BEFORE WE BEGIN",
    title: "Before We Begin…",
    paragraphs: [
      "Can I ask you something? Have you ever looked around and quietly wondered… “How is everyone else moving forward while I feel like I’m standing still?” Maybe you don’t say it out loud.",
      "You smile when your friends announce their engagement. You congratulate the person who just got the job you wanted. You like the pictures. You clap for people. You tell yourself you’re genuinely happy for them.",
      "And maybe you are. But later that night… When you’re finally alone… A different conversation begins.",
      "“I’m 24… what am I doing with my life?” “I’m 30 and I feel like I’ve wasted so much time.”",
      "“I know there’s more inside me, but I don’t know how to reach it.” “Why do I always feel like I’m behind?”",
      "“Why does everyone else seem to know who they are?” “What’s wrong with me?”",
      "Maybe you’ve never said those exact words. But you’ve felt them. That quiet panic. That invisible weight. That fear that time is moving faster than you are. You wake up hoping today will feel different.",
      "Then life happens. You scroll through your phone. Someone your age just bought a house. Someone else got married. Another person launched a business. Another person announced a promotion.",
      "And before you’ve even brushed your teeth… You’ve already started questioning your own life. Not because you’re lazy. Not because you’re jealous. But because somewhere deep inside…",
      "You’re afraid. Afraid that everyone else received a map for life… And yours got lost. If any part of that feels familiar… Can I tell you something? You’re not strange. You’re not crazy.",
      "And you’re definitely not the only one. I know because… That was me too."
    ],
    sections: [
      {
        title: "I Didn’t Know I Was Losing Myself",
        paragraphs: [
          "A few months ago… I packed a bag and left home. Not because I had everything figured out. Actually… It was the opposite. I didn’t know where I was going to stay. I didn’t have a place of my own.",
          "I didn’t have a stable income. I wasn’t leaving for a new job. Or a new apartment. Or a better opportunity. I was leaving because I was scared that if I stayed… I would slowly lose myself.",
          "That sentence still feels heavy to write. Because from the outside… It probably looked irresponsible. Some people might have wondered why I didn’t just stay, get a stable job, and play it safe.",
          "The truth is… I asked myself those same questions. Many times. I even tried. I went looking for jobs. I filled out applications. I imagined myself settling into a salary.",
          "There’s nothing wrong with honest work. But every time I pictured that path, something inside me whispered, “You’re abandoning the person you’re trying to become.” It wasn’t that I thought I was too"
        ]
      }
    ]
  },
  {
    page: 3,
    type: "text",
    partHeader: "INTRODUCTION",
    chapterHeader: "BEFORE WE BEGIN",
    paragraphs: [
      "good for a job.",
      "It was that I knew, deep inside, I was making a decision from fear rather than conviction. That frightened me. Because I had spent so much of my life making decisions based on what I thought would keep everyone else comfortable.",
      "I didn’t know who I was anymore. I only knew who I had learned to be. So I left. Not because I was fearless. Because I was terrified of disappearing."
    ],
    sections: [
      {
        title: "The Messages That Changed Everything",
        paragraphs: [
          "When I shared my story online… I expected people to scroll past. Instead… Something happened that I still struggle to put into words. Hundreds of strangers wrote to me. Not to tell me I was brave.",
          "Not to tell me I had all the answers. But to say things like:\n“I thought I was the only one.” “I’m 32 and I’m starting over.” “I’m 25 and I still live with my parents.” “I cry almost every day because I don’t know what to do.” “I know there’s something inside me, but I feel stuck.”",
          "“You just described my life.” I read those messages over and over again. Some of them made me cry. Not because I suddenly knew how to help everyone. But because I realized something.",
          "The greatest pain many of us carry isn’t failure. It’s believing we’re carrying it alone. Maybe that’s why you’re here. Maybe nobody has ever put words to what you’ve been feeling.",
          "Maybe you’ve been trying to explain it to people… But every time you do… They tell you to “just pray more.” Or “stop worrying.” Or “be patient.” Or “everyone has their own timing.”",
          "Sometimes those words are spoken with love. But they still leave you feeling unseen. Because they answer your situation… Without first understanding your experience. So before I say anything else…",
          "I want you to hear this. I see you. Not because I know everything about your life. But because I know what it feels like to quietly wonder whether you’ve lost yourself."
        ]
      },
      {
        title: "Why I Wrote This Guide",
        paragraphs: [
          "I didn’t write this because I’ve figured life out. I haven’t. I’m still learning. I’m still questioning. I’m still healing. I’m still discovering old beliefs that no longer deserve a place in my life.",
          "I’m still trying to become who God created me to be. So please don’t read these pages expecting instructions from someone who has arrived. Read them as an invitation from someone who is walking.",
          "Every lesson in this guide comes from something I’ve had to wrestle with. Every question comes from a question I first asked myself. Every insight was born from confusion before it became clarity."
        ]
      }
    ]
  },
  {
    page: 4,
    type: "text",
    partHeader: "INTRODUCTION",
    chapterHeader: "BEFORE WE BEGIN",
    paragraphs: [
      "And maybe that’s enough. Maybe you don’t need another expert. Maybe you just need someone willing to say, “Come. Let’s walk together.” That’s what this guide is. Not a map.",
      "A companion."
    ],
    sections: [
      {
        title: "Pause Here",
        paragraphs: [
          "Before you turn the page… I don’t want you to answer these questions perfectly. I just want you to answer them honestly."
        ]
      }
    ],
    pauseReflect: [
      "1. When was the last time you felt truly like yourself?",
      "2. What sentence do you repeat to yourself when things go wrong?",
      "3. If nobody expected anything from you for one year… who would you become?",
      "4. What are you most afraid will never change?"
    ],
    afterReflectText: "Don’t rush. You don’t need to impress anyone here. This guide isn’t about having the right answers. It’s about finally asking the questions you’ve been carrying in silence."
  },
  {
    page: 5,
    type: "part",
    number: "01",
    partTitle: "PART 01",
    title: "Maybe You’re Not Broken",
    subtitle: "A quiet look at the feeling of falling behind — and why it may not mean what you think."
  },
  {
    page: 6,
    type: "text",
    partHeader: "PART 01",
    chapterHeader: "MAYBE YOU'RE NOT BROKEN",
    title: "Maybe You’re Not Broken",
    paragraphs: [
      "Can I ask you something? Have you ever felt like you’re falling behind… but you can’t explain why? Not because you’re lazy. Not because you don’t have dreams. Not because you don’t believe in God."
    ],
    rememberThis: "Maybe the greatest pain so many of us carry isn't that we're lost. Maybe it's believing we're the only ones who are.",
    extraParagraphs: [
      "You just… feel behind. You wake up determined that today will be different. Then, before you’ve even left your bed… you pick up your phone. Someone your age just got engaged.",
      "Someone else just bought a car. Another person is celebrating a promotion. Someone you went to school with just launched a business. You smile. You tap “Congratulations.”",
      "You genuinely mean it. But after you put your phone down… you stare at the ceiling. And a question quietly slips into your mind. “When will it be my turn?” You don’t say it out loud.",
      "Because saying it out loud feels embarrassing. So you carry it alone. Maybe you’ve become really good at pretending. Your family thinks you’re okay. Your friends think you’re okay.",
      "People see you laughing. Posting. Showing up. But they don’t hear the conversations you have with yourself when no one is around. “I’m running out of time.” “Everyone else is moving except me.”",
      "“Maybe I’m not enough.” “Maybe I’ve already wasted my life.” “Maybe this is all I’ll ever become.” Those thoughts don’t usually arrive all at once. They arrive quietly. After another rejection.",
      "After another birthday. After another job that didn’t work out. After another opportunity you thought would change everything. After another prayer that seems to end in silence.",
      "One by one… they begin building a home inside your mind. Until one day… you stop questioning them. You simply call them “the truth.” Maybe you’ve even stopped dreaming the way you used to.",
      "Not because your dreams disappeared. Because disappointment became louder. Maybe you don’t speak up the way you once did. Not because you have nothing to say. Because you’re afraid of saying the wrong thing.",
      "Maybe you’ve become the person who overthinks every decision. The person who apologizes too much. The person who compares themselves to everyone else. The person who secretly believes everyone else received a map for life…"
    ]
  },
  {
    page: 7,
    type: "text",
    partHeader: "PART 01",
    chapterHeader: "MAYBE YOU'RE NOT BROKEN",
    paragraphs: [
      "except you. Or maybe your life looks successful from the outside. You have a job. People respect you. You smile in pictures. But deep down… you still feel like you’ve lost yourself somewhere along the way.",
      "You can’t explain it. You just know that the person you are today… doesn’t feel like the person you were created to become. If any of this feels familiar… I want you to pause for a second.",
      "Take a deep breath. And hear these words slowly. You are not the only one. When I shared my story online… I expected people to scroll past it. Instead… my inbox filled with messages from strangers.",
      "Not strangers from the same city. Not strangers from the same church. Not strangers who all lived the same life. People from different backgrounds. Different ages. Different stories.",
      "Yet their messages sounded almost identical. “I’m twenty-four and I feel lost.” “I’m thirty-two and I’m starting over.” “I feel like I’m just existing.” “I don’t know who I am anymore.”",
      "“I keep wondering what’s wrong with me.” “I thought I was the only one.” As I read those messages, something hit me. Maybe the greatest pain so many of us carry isn’t that we’re lost.",
      "Maybe it’s believing we’re the only ones who are. And loneliness has a strange way of turning questions into shame. When you think you’re the only one struggling… you stop asking for help.",
      "You stop talking about it. You stop believing things can change. You begin to carry your pain in silence. I know that silence. Because I carried it too. Not long ago, I found myself standing at a bus stop with a backpack.",
      "I was twenty-five years old. I didn’t have a place of my own. I didn’t have a stable income. I had left home without knowing exactly where I was going. From the outside… it probably looked like my life was falling apart.",
      "But something inside me knew… staying where I was was costing me something even more valuable. I was slowly losing myself. At the time, I didn’t have all the answers. Truthfully…",
      "I still don’t. I’m still learning. I’m still asking questions. I’m still discovering parts of myself I never knew were there. I’m still becoming. That’s why I didn’t write this guide to tell you how to fix your life.",
      "I wrote it because I want you to know something I wish someone had told me earlier. Maybe… just maybe… the question isn’t, “What’s wrong with me?” Maybe the better question is,",
      "“What story have I believed about myself for so long that it now feels like the truth?” That single question changed the direction of my own journey. And I have a feeling…",
      "it might become the beginning of yours too. Before you turn the page… don’t try to answer it perfectly. Just be willing to sit with it. Sometimes… our healing doesn’t begin the moment we find the right answer.",
      "Sometimes it begins the moment we finally ask the right question."
    ]
  },
  {
    page: 8,
    type: "part",
    number: "02",
    partTitle: "PART 02",
    title: "The Stories You Never Chose",
    subtitle: "The sentences you repeat about yourself were not all chosen by you."
  },
  {
    page: 9,
    type: "text",
    partHeader: "PART 02",
    chapterHeader: "THE STORIES YOU NEVER CHOSE",
    title: "The Stories You Never Chose",
    paragraphs: [
      "Have you ever noticed… how quickly your mind fills in the blanks? Someone doesn’t reply to your message. You immediately think, “Maybe I said something wrong.” Your boss says,"
    ],
    rememberThis: "Sometimes the first step toward freedom isn't finding a new story. It's finally realizing you've been living inside one.",
    extraParagraphs: [
      "“Can I see you for a minute?” Before you’ve even stood up… your heart starts racing. You assume you’ve done something wrong. Someone walks past you without saying hello. Now you’re wondering if they’re angry.",
      "You make one small mistake. Suddenly it feels like you’ve ruined everything. The strange thing is… none of those moments actually tell you what’s true. Yet somehow… your mind reaches a conclusion before reality has a chance to.",
      "Maybe you’ve noticed this too. You don’t just experience life. You interpret it. Every delay means something. Every silence means something. Every rejection means something.",
      "Every closed door becomes evidence that maybe… you’re the problem. It’s exhausting. Not because life is constantly attacking you. But because your mind never gets to rest.",
      "It keeps searching for proof. Proof that you’re behind. Proof that you’re not enough. Proof that everyone else is moving faster. Proof that you’ll never become the person you hoped you’d be.",
      "After a while… you stop questioning those thoughts. You simply assume they’re telling the truth. Maybe that’s why compliments feel uncomfortable. Someone tells you, “You did a great job.”",
      "You immediately think, “They’re just being nice.” Someone believes in you. You wonder what they’re missing. An opportunity comes your way. Instead of feeling excited… you start wondering whether you’re good enough to deserve it.",
      "It’s almost as if your mind has been trained to expect disappointment. Maybe you’ve lived like that for so long… you don’t even notice it anymore. It’s become normal. You call it being realistic.",
      "You call it being careful. You call it being humble. But deep down… it’s exhausting carrying a version of yourself that is always waiting for something to go wrong. I remember one day when I was getting ready for a filming job.",
      "Everything had already been arranged. The client had confirmed it. I packed my equipment. I was ready to leave. Then… Nothing. No message. No update. Almost immediately, a familiar thought appeared."
    ]
  },
  {
    page: 10,
    type: "text",
    partHeader: "PART 02",
    chapterHeader: "THE STORIES YOU NEVER CHOSE",
    paragraphs: [
      "“Maybe it’s because of me.” “Maybe something has gone wrong because I’m involved.” What amazes me now isn’t that I had those thoughts. It’s how quickly I believed them. I didn’t stop to ask if they were true.",
      "I accepted them as fact. A little while later… the client called. The event hadn’t been cancelled. The time had simply changed. That was all. Nothing was wrong. The problem only existed inside the story I had already created.",
      "That moment stayed with me. Not because the event was delayed. But because it made me ask a question I’d never asked before. “Why was that my first interpretation?” Not… “Why was the client late?”",
      "But… “Why did my mind immediately assume I was the problem?” I didn’t know the answer yet. But I knew I wanted to find it. So instead of judging myself for having the thought…",
      "I became curious about it. Looking back, I started noticing something. Some of the sentences I repeated most often weren’t things I had consciously chosen. They had become so familiar that they sounded like my own voice.",
      "Maybe you’ve experienced that too. Maybe there are sentences you’ve been repeating for years. “I’ll probably fail.” “People always leave.” “I’m not enough.” “Nothing ever works for me.”",
      "“I always mess things up.” Have you ever stopped and wondered… where those sentences came from? Not to blame anyone. Not to stay stuck in the past. Just to understand. Because it’s difficult to change a story you’ve never realized you’re repeating.",
      "And maybe… before asking, “How do I change my life?” there’s another question worth asking first. “What story have I been using to explain my life?” I don’t think that question changes everything overnight.",
      "But I do think it changes where transformation begins. Not with trying harder. Not with pretending you’re okay. But with becoming curious enough to notice the stories you’ve been calling truth.",
      "So here’s something I’d love for you to try today. The next time you catch yourself saying something negative about yourself… Don’t argue with it. Don’t shame yourself for thinking it.",
      "Just pause. Write the sentence down. Then gently ask, “Is this a fact… or is this a story I’ve been repeating?” You don’t have to answer it today. Just begin noticing. Sometimes… the first step toward freedom isn’t finding a new story. It’s finally realizing you’ve been living inside one."
    ]
  },
  {
    page: 11,
    type: "part",
    number: "03",
    partTitle: "PART 03",
    title: "When You Don’t Feel Like Himself Anymore",
    subtitle: "On missing the person you used to be — and slowly learning to hear them again."
  },
  {
    page: 12,
    type: "text",
    partHeader: "PART 03",
    chapterHeader: "WHEN YOU DON'T FEEL LIKE YOURSELF",
    title: "When You Don’t Feel Like Yourself Anymore",
    paragraphs: [
      "Have you ever looked at your own life… and quietly thought, “This can’t be all there is.” Not because your life is terrible. Not because everything is falling apart. Just because…"
    ],
    rememberThis: "You are not behind in becoming. You are becoming through the very questions you're brave enough to ask.",
    extraParagraphs: [
      "something feels missing. You wake up. You do what needs to be done. You answer messages. You go to work. You come home. You scroll. You laugh. You sleep. Then tomorrow… you do it all again.",
      "Nothing is obviously wrong. Yet nothing feels deeply right either. It’s a strange feeling. You’re living. But it doesn’t feel like you’re fully alive. Maybe you’ve never said that to anyone.",
      "Because how do you explain a feeling you don’t even understand yourself? So instead… you tell people you’re just tired. Or stressed. Or overwhelmed. Or waiting for things to get better.",
      "But deep down… you know it’s something else. Sometimes you miss the version of yourself you used to be. The version that dreamed without immediately thinking about failure.",
      "The version that believed anything was possible. The version that laughed more easily. The version that wasn’t constantly comparing timelines. Where did that person go? You don’t know.",
      "You just know you haven’t seen them in a while. Maybe that’s why birthdays have started feeling different. They used to be exciting. Now they make you nervous. Another year.",
      "Another reminder. Another quiet comparison. You tell yourself, “By this age I thought…” By this age… I’d have a career. By this age… I’d know what I’m doing. By this age…",
      "I’d have my own place. By this age… I’d have made my parents proud. By this age… I’d feel like an adult. Instead… you feel like you’re pretending. Like everyone else received instructions for life…",
      "and you’re somehow making yours up as you go. Maybe you’ve even started avoiding certain conversations. Not because you don’t enjoy people. But because you’re tired of answering the same questions.",
      "“So… what are you doing now?” “When are you getting married?” “Have you found a job yet?” “What’s next for you?” They sound like ordinary questions. But sometimes… they feel like tiny reminders of everything you think you haven’t become."
    ]
  },
  {
    page: 13,
    type: "text",
    partHeader: "PART 03",
    chapterHeader: "WHEN YOU DON'T FEEL LIKE YOURSELF",
    paragraphs: [
      "So you smile. You change the subject. You say, “I’m figuring things out.” Then later… you wonder if you actually are. Maybe you’ve noticed yourself shrinking. Not physically.",
      "Internally. You don’t share your ideas as much anymore. You don’t speak with the same confidence. You don’t take as many risks. You don’t believe in yourself the way you once did.",
      "It’s almost as if life has slowly convinced you to become smaller. Not all at once. Just little by little. Until one day… you hardly recognize yourself. The hardest part?",
      "You can’t even explain when it happened. There wasn’t one big moment. No single event. Just hundreds of small moments that slowly taught you to doubt yourself. Sometimes you wonder…",
      "“Am I actually lost?” Or… “Have I just forgotten who I am?” I used to think I was searching for purpose. That’s the phrase I kept using. “I need to find my purpose.” “I need to know what God wants me to do.”",
      "“I need clarity.” And those weren’t bad prayers. But eventually… I realized something. I wasn’t only searching for purpose. I was searching for myself. Because somewhere along the journey…",
      "I had become so focused on becoming someone… that I had stopped paying attention to who I was becoming. That realization didn’t instantly change my life. But it changed the questions I started asking.",
      "Instead of asking, “What should I do with my life?” I slowly began asking, “Who am I becoming while I wait?” That question felt different. Gentler. More honest. Because it reminded me that becoming isn’t something that begins after I finally have everything figured out.",
      "It’s happening now. On the confusing days. On the lonely days. On the days when I still don’t know exactly where I’m going. I’m becoming. And so are you. Maybe that’s the encouragement you needed today.",
      "Not that you should have everything figured out. But that your life hasn’t been put on pause just because you’re still finding your way. You are not behind in becoming. You are becoming through the very questions you’re brave enough to ask.",
      "So before you turn the page… I want you to sit with one question. Not the question everyone else keeps asking you. Not, “What do you want to do with your life?” A quieter question.",
      "One only you can answer. When was the last time you felt most like yourself? Don’t think about success. Or money. Or other people’s expectations. Think about you. Because I have a feeling…",
      "the person you’re trying so hard to become… may simply be the person you’ve slowly forgotten how to hear."
    ]
  },
  {
    page: 14,
    type: "part",
    number: "04",
    partTitle: "PART 04",
    title: "Have You Ever Wondered Where That Voice Came From?",
    subtitle: "Where the harshest voice inside you actually came from."
  },
  {
    page: 15,
    type: "text",
    partHeader: "PART 04",
    chapterHeader: "WHERE THAT VOICE CAME FROM",
    title: "Have You Ever Wondered Where That Voice Came From?",
    paragraphs: [
      "Have you ever noticed… that the loudest voice in your life… is usually your own? Not the voice that speaks out loud. The one that speaks quietly. The one nobody else hears."
    ],
    rememberThis: "Maybe that voice isn't the real you. Maybe it's just the loudest voice you've heard for the longest time.",
    extraParagraphs: [
      "The one that starts talking the moment something goes wrong. You make a mistake. It says, “Of course you did.” Someone doesn’t choose you. “See? You’re never enough.” An opportunity doesn’t work out.",
      "“Nothing ever works for you.” You fail once. “You always ruin everything.” What’s interesting is… you don’t argue with that voice anymore. You believe it. Almost instantly.",
      "It feels familiar. Like it’s been with you your whole life. Maybe that’s why it’s so convincing. Have you ever caught yourself apologizing… before you’ve even done anything wrong?",
      "Have you ever walked into a room… already assuming everyone is better than you? Have you ever wanted to speak… but convinced yourself that what you had to say wasn’t important?",
      "Have you ever received a compliment… and immediately looked for a reason not to believe it? Have you ever achieved something… yet somehow felt like you didn’t deserve it?",
      "Have you ever watched someone celebrate something beautiful… and instead of feeling inspired… you quietly wondered, “What’s wrong with me?” Maybe you’ve done something else too.",
      "Maybe you’ve become incredibly good at shrinking. You let other people go first. You keep your opinions to yourself. You don’t ask for too much. You don’t want to inconvenience anyone.",
      "You don’t want to seem proud. You don’t want to be “too much.” So little by little… you make yourself smaller. Not because that’s who you are. Because somewhere along the way…",
      "being small started feeling safer. Maybe you’ve even forgotten what it’s like to trust yourself. You ask everyone else what they think. You look for reassurance. You keep waiting for someone to tell you you’re ready.",
      "Because trusting your own voice feels dangerous. And here’s the difficult part. After living this way for years… it stops feeling unusual. It simply becomes… you. You don’t call it fear.",
      "You call it your personality. You don’t call it self-doubt. You call it being realistic. You don’t call it shame. You call it humility. You don’t call it a wound. You call it who you are."
    ]
  },
  {
    page: 16,
    type: "text",
    partHeader: "PART 04",
    chapterHeader: "WHERE THAT VOICE CAME FROM",
    paragraphs: [
      "I used to believe that too. I thought those thoughts were simply my thoughts. My personality. My way of seeing the world. I never stopped to ask a different question. Not,",
      "“Why am I like this?” But… “When did I first start believing this about myself?” That question changed something inside me. Because instead of judging myself… I became curious.",
      "I started noticing that many of the thoughts I called “my voice”… didn’t actually begin with me. Some were shaped by experiences. Some by disappointments. Some by fear. Some by words I heard over and over until they sounded true.",
      "I wasn’t making excuses. I was making observations. There’s a difference. Because once I stopped fighting myself… I could finally start understanding myself. And understanding created something I hadn’t felt in a long time.",
      "Hope. Because if a belief can be learned… maybe it can also be questioned. If it can be questioned… maybe it can be replaced. Not overnight. Not through pretending. But one honest moment at a time.",
      "So today… I don’t want you to change anything. Not yet. I don’t even want you to silence that inner voice. I simply want you to notice it. The next time it tells you, “You’re not enough.”",
      "Don’t immediately believe it. Don’t immediately fight it either. Just ask one gentle question. “Who taught me to speak to myself like this?” You might not know the answer today.",
      "That’s okay. The purpose of the question isn’t to make you blame someone. It’s to help you realize something. Maybe… that voice isn’t the real you. Maybe… it’s just the loudest voice you’ve heard for the longest time.",
      "And those are not always the same thing."
    ]
  },
  {
    page: 17,
    type: "part",
    number: "05",
    partTitle: "PART 05",
    title: "You Didn’t Become This Person Overnight",
    subtitle: "Why change feels so hard — and what quietly lives underneath the reaction."
  },
  {
    page: 18,
    type: "text",
    partHeader: "PART 05",
    chapterHeader: "YOU DIDN'T BECOME THIS OVERNIGHT",
    title: "You Didn’t Become This Person Overnight",
    paragraphs: [
      "Maybe you’ve asked yourself this before. “Why am I like this?” Not out loud. Just quietly. On the drive home. While staring at the ceiling. While brushing your teeth. While watching someone else become the person you wish you were becoming."
    ],
    rememberThis: "You can't heal what you keep hiding from yourself.",
    extraParagraphs: [
      "“Why do I always overthink?” “Why do I always expect the worst?” “Why do I push people away when they get close?” “Why do I keep settling for less than I know I’m capable of?”",
      "“Why do I keep abandoning myself?” Maybe you’ve promised yourself a hundred times… “Tomorrow, I’ll be different.” Tomorrow comes. For a few hours… you are. Then something happens.",
      "Someone says something that hurts. A plan doesn’t work out. You get rejected. You feel ignored. You make a mistake. And somehow… without even realizing it… you’re right back to being the version of yourself you were trying so hard to leave behind.",
      "That’s frustrating. Because it makes you wonder if change is even possible. You start thinking, “Maybe this is just who I am.” “Maybe I’ll always be like this.” “Maybe people don’t really change.”",
      "Can I ask you something? What if the reason change feels so difficult… is because you’ve been trying to fight the fruit… without ever looking at the root? Think about it.",
      "Most of us notice our reactions. Very few of us stop to ask where those reactions came from. We notice that we panic. But not when we first learned that the world wasn’t safe.",
      "We notice that we struggle to trust people. But not when trust was first broken. We notice that we constantly need other people’s approval. But not when we first started believing approval meant love.",
      "We notice that we feel like we’re never enough. But not when we first learned to measure our worth by performance. So we spend years fighting behaviors… without understanding the beliefs quietly feeding them.",
      "It’s like pulling leaves off a tree… while wondering why they keep growing back. Maybe you’ve experienced something else too. Maybe you’ve caught yourself reacting in a way that surprised you.",
      "You hear yourself say something and immediately think, “Why did I say that?” Or you avoid a conversation you know you need to have. Or you say “yes” when every part of you wanted to say “no.”"
    ]
  },
  {
    page: 19,
    type: "text",
    partHeader: "PART 05",
    chapterHeader: "YOU DIDN'T BECOME THIS OVERNIGHT",
    paragraphs: [
      "Or you apologize for something that wasn’t even your fault. Then later… you replay the moment in your mind. “Why do I always do that?” You’re not trying to become that person.",
      "It just… happens. Almost automatically. Like your mind already knows the script before you’ve even entered the scene. For a long time… those moments made me feel defeated.",
      "I thought they proved I wasn’t changing. Now… I see them differently. Not as proof that I’m hopeless. But as clues. Clues pointing toward places inside me that still need attention.",
      "Clues that there’s a story underneath the reaction. Clues that there’s a belief underneath the behavior. That shift changed everything. Because I stopped asking, “What’s wrong with me?”",
      "And started asking, “What is this reaction trying to show me?” That one question turned moments of shame into moments of curiosity. Instead of attacking myself… I started paying attention.",
      "And paying attention taught me something I’ll never forget. You can’t heal what you keep hiding from yourself. Not because you’re weak. Because hidden things remain unnamed.",
      "And unnamed things quietly shape our lives. So here’s something I’d love for you to try this week. The next time you react in a way that frustrates you… Don’t rush to fix it.",
      "Don’t call yourself a failure. Don’t promise you’ll “do better.” Just pause. Ask yourself:",
      "“What happened just before I felt this?” Then ask:",
      "“What did I believe in that moment?” That’s all. You don’t need to solve your whole life today. You don’t need to untangle every part of your past. Just become someone who notices.",
      "Because I’ve discovered that awareness isn’t the finish line. It’s the doorway. And sometimes… walking through that doorway is the bravest thing you’ll do all week."
    ]
  },
  {
    page: 20,
    type: "part",
    number: "06",
    partTitle: "PART 06",
    title: "Are You Waiting for Your Life to Begin?",
    subtitle: "On the hidden cost of waiting to feel ready before you begin."
  },
  {
    page: 21,
    type: "text",
    partHeader: "PART 06",
    chapterHeader: "ARE YOU WAITING TO BEGIN?",
    title: "Are You Waiting for Your Life to Begin?",
    paragraphs: [
      "Maybe you keep telling yourself… “Once I figure things out… then I’ll really start living.” Once I get a job. Once I move out. Once I have enough money. Once I heal. Once I stop overthinking."
    ],
    rememberThis: "Something beautiful happens when we stop waiting for life to begin. We realize it quietly began the moment we chose to move.",
    extraParagraphs: [
      "Once I become confident. Once I know my purpose. Then… I’ll finally become the person I’m supposed to be. Until then… life feels like a waiting room. You’re present. But you’re not really living.",
      "You’re preparing to live. Maybe you’ve been preparing for years. You save ideas in your notes app. You bookmark videos. You write goals. You buy journals. You imagine the future version of yourself.",
      "The confident one. The disciplined one. The successful one. The healed one. You can see that version so clearly. The only problem is… you don’t believe you’re that person yet.",
      "So you wait. You tell yourself, “When I’m more confident…” “When I know enough…” “When I have more experience…” “When I stop being afraid…” Then I’ll start. But somehow… that day never comes.",
      "Because every time you get close… your mind moves the finish line. You achieve one thing. Now it tells you that you need something else first. You make progress. It reminds you of what you still haven’t done.",
      "You finally gather the courage to start. It whispers, “You’re still not ready.” It’s exhausting. Not because you’re lazy. Because you’re chasing a version of readiness that doesn’t exist.",
      "Maybe you’ve noticed this in small ways. You keep rewriting the same plan. You keep changing directions. You keep saying, “I’ll start on Monday.” Then Monday becomes next month.",
      "Then next month becomes next year. Not because you don’t care. Because you’re waiting to feel certain. Maybe you’ve even watched other people begin. People who seem less talented.",
      "Less prepared. Less experienced. You wonder, “How can they be so confident?” Maybe they’re not. Maybe they just stopped waiting. For a long time… I thought I needed clarity before I could move.",
      "I thought one day God would reveal the entire path. Every step. Every answer. Every detail. Then I’d finally have the confidence to begin. Instead… my journey looked nothing like that.",
      "I left home without knowing exactly where I would end up. I didn’t have a perfect plan. I didn’t know how everything would work. I simply knew that staying where I was… was slowly costing me the person I"
    ]
  },
  {
    page: 22,
    type: "text",
    partHeader: "PART 06",
    chapterHeader: "ARE YOU WAITING TO BEGIN?",
    paragraphs: [
      "was becoming.",
      "Looking back… I don’t think courage came first. Movement did. Every small step taught me something the previous one couldn’t. Not because I had become fearless. Because I had become willing.",
      "And maybe… that’s the part we don’t talk about enough. Maybe becoming isn’t reserved for people who feel ready. Maybe becoming begins with people who move while they’re still uncertain.",
      "People who ask questions while they’re still confused. People who keep walking while they’re still afraid. Maybe that’s why waiting can become so dangerous. Not because waiting is always wrong.",
      "But because sometimes… we’re waiting for permission that has already been given. So today… I don’t want you to make a five-year plan. I don’t want you to figure out your entire purpose.",
      "I don’t even want you to answer every question in your head. I only want you to answer one. What is one small step you’ve been postponing because you’re waiting to feel ready?",
      "Maybe it’s making the phone call. Maybe it’s writing the first page. Maybe it’s applying for the opportunity. Maybe it’s saying no. Maybe it’s saying yes. Maybe it’s asking for help.",
      "Maybe it’s simply believing that your life hasn’t been put on hold. Whatever it is… Don’t think about the next fifty steps. Just think about the next one. Because something beautiful happens when we stop waiting for life to begin.",
      "We realize… it quietly began the moment we chose to move."
    ]
  },
  {
    page: 23,
    type: "part",
    number: "07",
    partTitle: "PART 07",
    title: "The Life You Thought You’d Have",
    subtitle: "Grieving the life you imagined, and releasing a timeline that was never yours."
  },
  {
    page: 24,
    type: "text",
    partHeader: "PART 07",
    chapterHeader: "THE LIFE YOU THOUGHT YOU'D HAVE",
    title: "The Life You Thought You’d Have",
    paragraphs: [
      "Have you ever imagined what your life would look like by now? Maybe you did it when you were sixteen. Or eighteen. Or twenty. You pictured the future version of yourself."
    ],
    rememberThis: "It's time to stop measuring your life against a clock that was never yours to begin with.",
    extraParagraphs: [
      "Confident. Successful. Certain. You thought that by now… you’d know who you were. You’d have your career. Your own place. Financial peace. Meaningful friendships. Maybe even a family.",
      "Back then… the future felt exciting. Now… sometimes it feels heavy. Not because your life has no value. Because it doesn’t look the way you imagined it would. Maybe that’s why birthdays feel complicated.",
      "People tell you, “Happy Birthday!” You smile. You cut the cake. You take the pictures. But somewhere inside… you’re counting something else. Not candles. Years. Years you think you’ve lost.",
      "Years you think you wasted. Years you believe everyone else used better than you did. Maybe you’ve even caught yourself doing this. You see someone your age succeeding. Instead of simply celebrating them…",
      "you quietly compare your life to theirs. Not because you’re a bad person. Because their success accidentally reminds you of the life you thought you’d already be living. You don’t envy them.",
      "You grieve for yourself. That’s a very different feeling. Maybe you’ve never had words for it. Maybe you’ve just been calling it pressure. Or anxiety. Or frustration. But underneath those feelings…",
      "there’s another one. Disappointment. Not in other people. In yourself. You replay old decisions. “If only I had started earlier.” “If only I hadn’t been afraid.” “If only I had made a different choice.”",
      "“If only I knew then what I know now.” Those “if onlys” can become exhausting. Because no matter how many times you replay yesterday… it never changes. Yet your mind keeps returning there.",
      "Almost as if it’s trying to rewrite a story that’s already been written. Maybe you’ve started believing you’ve missed your moment. That everyone else caught a train… and yours has already left the station.",
      "Maybe that’s why it’s become harder to dream. Not because you don’t want to. Because dreaming now feels risky. What if you hope again… and life disappoints you again? Sometimes it feels safer not to expect too much."
    ]
  },
  {
    page: 25,
    type: "text",
    partHeader: "PART 07",
    chapterHeader: "THE LIFE YOU THOUGHT YOU'D HAVE",
    paragraphs: [
      "Safer not to imagine too much. Safer not to believe too much. At least then… you can’t be hurt again. I understand that feeling. There have been moments in my own journey where I looked at my age…",
      "my circumstances… my uncertainty… and quietly wondered, “Am I too late?” I didn’t say it to anyone. But I asked it inside myself. More than once. Then one day… another thought interrupted that question.",
      "A simple one. But one I haven’t forgotten. What if I’m comparing my real life… to a timeline I created when I knew almost nothing about life? That thought stopped me. Because the version of me who imagined life at eighteen…",
      "had never experienced failure. Had never experienced heartbreak. Had never experienced responsibility. Had never experienced disappointment. Of course his timeline looked perfect.",
      "It was written without knowing what life actually costs. That didn’t erase my grief. But it softened it. It reminded me that I wasn’t failing some universal schedule. I was grieving an imaginary one.",
      "And maybe… that’s where grace begins. Not by pretending you haven’t lost time. But by refusing to believe lost time means a lost future. So before you turn the page… I want you to try something.",
      "Instead of asking, “Why am I so behind?” Ask yourself this:",
      "“Who decided where I was supposed to be by now?” Sit with that question. Because sometimes… the timeline making you feel like a failure… was never written by God. It was written by comparison.",
      "By expectation. By fear. And maybe… it’s time to stop measuring your life against a clock that was never yours to begin with."
    ]
  },
  {
    page: 26,
    type: "part",
    number: "08",
    partTitle: "PART 08",
    title: "Maybe It Was Never Just You",
    subtitle: "Some of what you carry was handed to you long before you could choose it."
  },
  {
    page: 27,
    type: "text",
    partHeader: "PART 08",
    chapterHeader: "MAYBE IT WAS NEVER JUST YOU",
    title: "Maybe It Was Never Just You",
    paragraphs: [
      "For a long time… I thought every struggle I had belonged to me. Every fear. Every insecurity. Every reaction. Every habit. Every thought. I believed they all started with me."
    ],
    rememberThis: "If something can be learned, it can also be questioned. If it can be questioned, it can slowly be replaced.",
    extraParagraphs: [
      "If I overthought… that was just my personality. If I stayed quiet… that was just who I was. If I constantly doubted myself… I assumed something inside me was broken. So I kept trying to fix myself.",
      "I tried becoming more confident. More disciplined. More positive. More spiritual. But no matter how hard I tried… I kept running into the same version of myself. Maybe you’ve felt that too.",
      "You promise yourself you’ll respond differently next time. Then next time comes… and somehow… you’re back in the same place. The same fear. The same reaction. The same thoughts.",
      "The same cycle. It’s confusing. Because you genuinely want to change. So why does it feel like something keeps pulling you back? For a long time… I asked, “What’s wrong with me?”",
      "Then one day… I asked a different question. One that changed the direction of my search. “What if some of the things I’ve been calling my personality… are actually patterns?”",
      "I didn’t know the answer. I wasn’t trying to prove anything. I was just curious. Because something wasn’t adding up. I grew up believing that the struggles in my family were almost entirely spiritual.",
      "If something kept repeating… we prayed harder. If life became difficult… we prayed harder. If another problem appeared… we prayed harder. Prayer was never the problem. It still isn’t.",
      "But I couldn’t ignore something I had quietly noticed. The prayers were sincere. The love for God was sincere. Yet some of the same struggles kept returning. Not exactly the same situations.",
      "But the same kinds of pain. The same fears. The same ways of relating to one another. The same emotional wounds. The same reactions. That question stayed with me. One day…",
      "I decided to search for answers. Not because I wanted to argue with my family. Not because I wanted to prove anyone wrong. Because I wanted to understand. What I found surprised me.",
      "The phrase “generational patterns” kept appearing. As I read… I realized it wasn’t talking only about mysterious spiritual forces. It was also describing something incredibly human.",
      "How beliefs can be passed down. How fears can be learned. How ways of thinking can become normal simply because we’ve lived around them for so long. How children often inherit more than their parents’"
    ]
  },
  {
    page: 28,
    type: "text",
    partHeader: "PART 08",
    chapterHeader: "MAYBE IT WAS NEVER JUST YOU",
    paragraphs: [
      "faces.",
      "Sometimes… they inherit the stories their parents believed about life. I sat there looking at my phone for a long time. Part of me wanted to reject what I was reading. Because it challenged everything I had always believed.",
      "Another part of me couldn’t ignore what I was beginning to see. Not just in my family. In myself. Suddenly… some things started making sense. Not everything. But enough to keep asking better questions.",
      "Maybe that’s all this chapter is inviting you to do. Not to abandon your faith. Not to blame your parents. Not to rewrite your entire life overnight. Just to become curious.",
      "Curious enough to ask, “What have I been carrying that I never consciously chose?” Because sometimes… freedom doesn’t begin the moment you find every answer. Sometimes… it begins the moment you realize the struggle may be bigger than your personality.",
      "Maybe… it isn’t that you were born broken. Maybe… you learned ways of seeing yourself and the world that once helped someone survive… but are no longer helping you become who you’re meant to become.",
      "And if something can be learned… it can also be questioned. If it can be questioned… it can slowly be replaced. Not with shame. Not with denial. But with truth. One honest step at a time."
    ]
  },
  {
    page: 29,
    type: "part",
    number: "09",
    partTitle: "PART 09",
    title: "Awareness Is the Doorway, Not the Destination",
    subtitle: "Seeing clearly is where the journey starts — not where it ends."
  },
  {
    page: 30,
    type: "text",
    partHeader: "PART 09",
    chapterHeader: "AWARENESS IS THE DOORWAY",
    title: "Awareness Is the Doorway, Not the Destination",
    paragraphs: [
      "If you’ve made it this far… there’s a chance something has already started happening inside you. Maybe you’ve recognized yourself in these pages. Maybe you’ve finally found words for feelings you’ve been carrying for years."
    ],
    rememberThis: "Awareness doesn't finish the journey. It begins it.",
    extraParagraphs: [
      "Maybe you’ve caught yourself thinking, “That explains so much.” If that’s where you are… I’m genuinely grateful. Because before anything can change… it usually has to be seen.",
      "For a long time, I couldn’t explain why I felt the way I did. I only knew that something wasn’t right. When I finally began recognizing inherited beliefs, emotional wounds, old fears, and unhealthy patterns…",
      "it felt like someone had turned the lights on in a dark room. Suddenly… I could see. And seeing felt powerful. Maybe you’ve experienced that too. Have you ever learned something about yourself…",
      "and felt relieved just because you finally understood it? It’s a beautiful feeling. But I’ve also learned something that surprised me. Understanding isn’t the same as changing.",
      "I used to think that once I understood why I struggled… everything else would naturally fall into place. It didn’t. I could explain my patterns… and still repeat them. I could recognize fear…",
      "and still let it make my decisions. I could understand where a belief came from… and still live as if it were true. That was frustrating. Because I thought awareness was the finish line.",
      "Now I’m beginning to see it differently. Awareness doesn’t finish the journey. It begins it. It’s like standing at the entrance of a path you’ve never walked before. Seeing the path matters.",
      "But eventually… you have to take the first step. I’ve noticed something in myself. Sometimes it’s easier to keep learning than it is to keep changing. Learning feels safe.",
      "Changing asks something of us. Learning can happen while sitting still. Becoming asks us to move. I don’t say that to make you feel guilty. I say it because I’m still learning it too.",
      "I’m still catching myself. Still noticing old reactions. Still uncovering beliefs I didn’t know I was carrying. Still choosing, some days better than others, to respond differently.",
      "That’s why I don’t want this guide to become another thing you simply understand. I hope it becomes something you slowly begin to live. Not perfectly. Not all at once. One choice at a time."
    ]
  },
  {
    page: 31,
    type: "text",
    partHeader: "PART 09",
    chapterHeader: "AWARENESS IS THE DOORWAY",
    paragraphs: [
      "One honest conversation at a time. One new thought at a time. One small act of courage at a time. If awareness is the doorway… then becoming is the journey that starts after you walk through it.",
      "And if you’ve reached this point… I think you’re ready. Not because you have everything figured out. But because you’re willing to take the next step. And sometimes… that’s all becoming has ever asked of us."
    ]
  },
  {
    page: 32,
    type: "part",
    number: "10",
    partTitle: "PART 10",
    title: "What Becoming Actually Looks Like",
    subtitle: "What becoming actually looks like, one honest step at a time."
  },
  {
    page: 33,
    type: "text",
    partHeader: "PART 10",
    chapterHeader: "WHAT BECOMING LOOKS LIKE",
    title: "What Becoming Actually Looks Like",
    paragraphs: [
      "For a long time… I thought becoming was a destination. I imagined that one day I’d finally arrive. I’d know exactly who I was. I’d never doubt myself again. I’d have everything figured out."
    ],
    rememberThis: "Becoming isn't one big moment. It's a rhythm. A way of living. A journey you keep choosing.",
    extraParagraphs: [
      "Life would make sense. The fear would disappear. The questions would stop. I’d finally become the person God created me to be. Maybe you’ve imagined that day too. The day when everything finally clicks.",
      "But somewhere along this journey… I’ve started realizing something. Becoming doesn’t look the way I thought it would. It doesn’t begin with certainty. It begins with honesty.",
      "It doesn’t begin with having all the answers. It begins with admitting that the old answers are no longer working. That’s where my own journey began. Not when I had everything figured out.",
      "When I finally admitted… “The way I’ve been living isn’t leading me where I want to go.” That admission hurt. But it also set me free. Because pretending was keeping me stuck.",
      "From there… I started noticing things I had never noticed before. The thoughts that weren’t really mine. The fears I had inherited. The beliefs I had accepted without questioning.",
      "The ways I kept abandoning myself just to feel accepted. I couldn’t unsee them anymore. Then came the hard part. I had to ask uncomfortable questions. Questions about my family.",
      "Questions about my beliefs. Questions about myself. Questions I had spent years avoiding because I was afraid of what the answers might ask of me. Some of those answers led me to places I never expected.",
      "Some asked me to let go. Not of people… but of versions of myself that could no longer carry me into the future. That wasn’t easy. Sometimes I still miss the comfort of familiar patterns.",
      "Even unhealthy ones. Because familiar feels safe. But staying the same was costing me more than changing ever would. And little by little… through choices that nobody applauded…",
      "through prayers that gave me direction instead of excuses… through days when I got it right and days when I didn’t… I began becoming. Not all at once. One decision at a time."
    ]
  },
  {
    page: 34,
    type: "text",
    partHeader: "PART 10",
    chapterHeader: "WHAT BECOMING LOOKS LIKE",
    paragraphs: [
      "One conversation at a time. One act of courage at a time. One step at a time. That’s when I realized something. Becoming isn’t one big moment. It’s a rhythm. A way of living.",
      "A journey you keep choosing. The more I reflected on my own story… the more I realized that almost every meaningful change I’ve experienced followed the same path. Not perfectly.",
      "But consistently. It always looked something like this."
    ],
    bentoBoxes: [
      { title: "Wake Up", text: "You begin noticing what you’ve been living without noticing. You stop blaming everything outside you and become curious about what’s happening within you." },
      { title: "Question", text: "You start asking honest questions. Not to criticize yourself… but to understand yourself." },
      { title: "Let Go", text: "You release the beliefs, fears, habits, and identities that no longer belong in the life you’re becoming. Not because it’s easy. Because carrying them has become too expensive." },
      { title: "Become", text: "You begin living differently. Not perfectly. But intentionally. One choice at a time." },
      { title: "Give Back", text: "One day, you look behind you and realize someone else is standing where you once stood. Instead of saying, “Figure it out on your own,” you turn around and say, “Walk with me.” That’s what this journey has become for me." }
    ],
    afterBentoText: "And maybe… that’s what it’s becoming for you too. This isn’t a formula. It’s not a shortcut. It’s not five steps to a perfect life. It’s simply the language I’ve found for a journey I’m still walking."
  },
  {
    page: 35,
    type: "text",
    partHeader: "PART 10",
    chapterHeader: "WHAT BECOMING LOOKS LIKE",
    paragraphs: [
      "I don’t wake up every day feeling like I’ve arrived. I wake up each day trying to become. And maybe that’s enough. Maybe becoming was never about reaching a finish line. Maybe it was always about faithfully taking the next step God places in front of you.",
      "If that’s true… then you don’t have to have your whole life figured out today. You only have to keep walking. And if you’re willing to do that… welcome. You’re already becoming."
    ]
  },
  {
    page: 36,
    type: "part",
    number: "11",
    partTitle: "PART 11",
    title: "The First Seven Days of Becoming",
    subtitle: "A gentle seven-day practice to begin — not to fix yourself, simply to start."
  },
  {
    page: 37,
    type: "text",
    partHeader: "PART 11",
    chapterHeader: "THE FIRST SEVEN DAYS",
    title: "The First Seven Days of Becoming",
    paragraphs: [
      "If you’ve made it this far… you might be wondering something. “Where do I even begin?” I used to ask myself that too. I thought I needed a perfect plan. A perfect morning routine."
    ],
    rememberThis: "You don't become a new person in one week. But one week can begin the journey of becoming someone new.",
    extraParagraphs: [
      "A perfect prayer life. A perfect understanding of my purpose. I kept waiting until I felt “ready.” But I’ve realized something. Most of us don’t need a bigger plan. We need a smaller first step.",
      "That’s why I don’t want to ask you to change your whole life this week. I don’t think that’s how real transformation happens. Real transformation usually begins so quietly…",
      "you almost miss it. One thought. One question. One decision. One honest moment. So over the next seven days… I want to invite you to do something simple. Not to prove yourself.",
      "Not to impress God. Not to become perfect. Simply… to begin."
    ],
    days: [
      { day: "1", title: "Notice.", text: "Today, don’t try to fix yourself. Just notice yourself. Pay attention to your thoughts. Especially the ones that show up automatically. When you make a mistake… what do you immediately say to yourself? When something goes wrong… what story does your mind quickly begin to tell? Don’t judge those thoughts. Just notice them. Awareness is where becoming begins." },
      { day: "2", title: "Ask.", text: "Choose one thought you noticed yesterday. Now ask it one simple question. “Is this really true?” Or… “Who taught me to believe this?” Don’t rush the answer. Sometimes the question changes us before the answer ever does." }
    ]
  },
  {
    page: 38,
    type: "text",
    partHeader: "PART 11",
    chapterHeader: "THE FIRST SEVEN DAYS",
    days: [
      { day: "3", title: "Remember.", text: "Think about a moment from your childhood or teenage years that still lives inside you. Not to blame anyone. Not to stay stuck in the past. Simply to understand yourself with a little more compassion. Sometimes the adult we’re becoming is still carrying the child who never felt seen." },
      { day: "4", title: "Choose.", text: "Today, make one small choice that reflects the person you’re becoming. Not the person you’re afraid of being. Maybe it’s saying “no.” Maybe it’s speaking up. Maybe it’s resting. Maybe it’s applying for that opportunity. Maybe it’s forgiving yourself. Small choices quietly become new identities." },
      { day: "5", title: "Pray.", text: "Not because prayer replaces action. Because prayer gives direction to action. You don’t have to use perfect words. Just be honest. Tell God where you are. Tell Him what you’re afraid of. Tell Him what you’re hoping for. Then listen. Sometimes becoming begins in the quiet moments we usually rush past." },
      { day: "6", title: "Act.", text: "Take one step you’ve been avoiding. Not ten. One. Send the message. Make the phone call. Start the application. Write the first page. Record the first video. Begin. Courage rarely feels like confidence. Most of the time… it simply looks like movement." },
      { day: "7", title: "Look Back.", text: "Before you rush into another week… pause. Ask yourself: “What did I notice about myself this week?” “What surprised me?” “What felt different?” Celebrate even the smallest change. Because becoming isn’t measured only by giant breakthroughs. Sometimes it’s measured by the fact that you responded differently than you would have last week. And that’s worth celebrating." }
    ],
    afterDaysText: "If you only remember one thing from these seven days… let it be this:"
  },
  {
    page: 39,
    type: "text",
    partHeader: "PART 11",
    chapterHeader: "THE FIRST SEVEN DAYS",
    paragraphs: [
      "You don’t become a new person in one week. But one week can begin the journey of becoming someone new. And sometimes… that’s all God asks us to do. Take the next faithful step."
    ]
  },
  {
    page: 40,
    type: "part",
    number: "12",
    partTitle: "PART 12",
    title: "A Letter From Someone Still Becoming",
    subtitle: "A closing letter from someone still walking the very same road as you."
  },
  {
    page: 41,
    type: "text",
    partHeader: "PART 12",
    chapterHeader: "A LETTER TO YOU",
    title: "A Letter From Someone Still Becoming",
    paragraphs: [
      "If you’ve read this far… thank you. Not because you finished a guide. But because you were willing to be honest with yourself. That isn’t easy. I know, because I’m trying to do the same."
    ],
    rememberThis: "Becoming was never about getting it right every single day. It was always about refusing to stop walking.",
    extraParagraphs: [
      "If I’m honest… there are still days I don’t have all the answers. There are mornings I wake up feeling confident. And there are mornings I question everything. There are days when I feel like I’m finally becoming the man God created me to be.",
      "And there are days when old fears try to convince me that nothing has changed. I’m still learning. Still healing. Still questioning. Still praying. Still taking responsibility.",
      "Still getting things wrong sometimes. Still getting back up. I’m still becoming. Maybe that’s why I wanted to write this guide. Not because I’ve arrived somewhere you haven’t.",
      "But because I got tired of pretending I had to arrive before I could be useful. The truth is… everything you’ve read here… I’m trying to live too. Some days I live it well.",
      "Some days I don’t. But every day I choose to begin again. That’s the promise I’ve made to myself. Not perfection. Faithfulness. If there’s one thing I hope you take away from these pages…",
      "it’s this:",
      "Please don’t wait until you have everything figured out before you begin living. Don’t wait until you feel fearless before you take the next step. Don’t wait until you know your entire purpose before you start walking toward it.",
      "And don’t believe the lie that because you’re still struggling… you’re not growing. Growth is often quieter than we expect. Sometimes it looks like asking a better question.",
      "Sometimes it looks like saying “no” when you used to say “yes.” Sometimes it looks like resting instead of pretending you’re okay. Sometimes it looks like apologizing. Sometimes it looks like leaving.",
      "Sometimes it looks like staying. Sometimes it simply looks like choosing hope one more time. If you’re anything like me… there will be moments after reading this guide when you fall back into old thoughts.",
      "Old fears. Old habits. When that happens… please don’t use this guide as another reason to criticize yourself. Use it as a reminder to come home again. Come back to awareness."
    ]
  },
  {
    page: 42,
    type: "text",
    partHeader: "PART 12",
    chapterHeader: "A LETTER TO YOU",
    paragraphs: [
      "Come back to honesty. Come back to God. Come back to becoming. Because becoming was never about getting it right every single day. It was always about refusing to stop walking.",
      "I don’t know where you’ll be a year from now. I don’t know what prayers God will answer. I don’t know what doors will open. I don’t know what battles you’ll overcome. But I hope one thing is true.",
      "I hope you’re kinder to yourself than you were when you first opened these pages. I hope you’re asking better questions. I hope you’re carrying less shame. I hope you’re living with more courage.",
      "I hope you’re beginning to see yourself the way God sees you. Not as someone who’s too late. Not as someone who’s too broken. Not as someone who has failed beyond repair.",
      "But as someone who is still being formed. Still being refined. Still becoming. As for me… I’ll still be here. Still documenting. Still learning. Still falling. Still getting back up.",
      "Still sharing what I’m discovering. Not because I’ve reached the finish line… but because I believe we were never meant to walk this road alone. So if life feels heavy again…",
      "come back. Read these pages again. Watch another video. Write another journal entry. Pray another honest prayer. Take another small step. And remember… you don’t have to become everything God created you to be today.",
      "You only have to take today’s step. The rest will come one faithful step at a time. Until then… I’ll see you further down the road. We’re becoming. Together.",
      "— Gbolahan"
    ]
  }
];

// PDF Creator function
function createEbookPDF() {
  const targetPath = path.join(process.cwd(), "public", "ebook.pdf");
  console.log(`Generating real, high-quality PDF to: ${targetPath}`);

  // Create high resolution Letter document
  const doc = new PDFDocument({
    size: "LETTER",
    margin: 0, // handles margins per page type
    bufferPages: true
  });

  const stream = fs.createWriteStream(targetPath);
  doc.pipe(stream);

  // Styling Constants
  const DARK_SLATE = "#1e293b"; // Slate-800
  const TEXT_MUTED = "#64748b"; // Slate-500
  const TEXT_DARK = "#334155"; // Slate-700
  const GOLD = "#b45309"; // Amber-700
  const BG_LIGHT = "#f8fafc"; // Slate-50

  PAGES.forEach((p, idx) => {
    if (idx > 0) {
      doc.addPage({ size: "LETTER", margin: 0 });
    }

    if (p.type === "cover") {
      // 1. Cover Page Layout
      // Full background
      doc.rect(0, 0, 612, 792).fill(DARK_SLATE);

      // becoming. title top-left
      doc.fillColor("#ffffff")
         .font("Helvetica-Bold")
         .fontSize(22)
         .text("becoming.", 54, 54);

      // Elegant gold divider line
      doc.rect(54, 85, 40, 3).fill(GOLD);

      // Book Title
      doc.fillColor("#ffffff")
         .font("Helvetica-Bold")
         .fontSize(38)
         .text("The First Step\nto Becoming", 54, 130, { lineGap: 6 });

      // Subtitle
      doc.fillColor("#cbd5e1") // light gray
         .font("Helvetica")
         .fontSize(15)
         .text("Why You Feel Lost (And Where to Begin)", 54, 230);

      // Three elegant stats cards
      const startY = 280;
      const boxWidth = 150;
      const spacingX = 20;

      p.stats.forEach((stat, sIdx) => {
        const xPos = 54 + sIdx * (boxWidth + spacingX);
        
        // Draw card background
        doc.rect(xPos, startY, boxWidth, 140)
           .fill("#273549"); // Slightly lighter slate
           
        // Stat large number
        doc.fillColor("#fcd34d") // beautiful warm gold
           .font("Helvetica-Bold")
           .fontSize(32)
           .text(stat.num, xPos + 15, startY + 15);

        // Stat label
        doc.fillColor("#e2e8f0")
           .font("Helvetica-Bold")
           .fontSize(9.5)
           .text(stat.label, xPos + 15, startY + 58, { lineGap: 3 });
      });

      // Capsule text (A Companion, not a Map)
      doc.roundedRect(54, 460, 185, 28, 14)
         .fill("#0f172a"); // Jet Black capsule

      doc.fillColor("#e2e8f0")
         .font("Helvetica-Bold")
         .fontSize(9.5)
         .text(p.capsule, 70, 469);

      // White area at bottom like the actual design
      doc.rect(0, 520, 612, 272).fill("#ffffff");

      // Author Label
      doc.fillColor(DARK_SLATE)
         .font("Helvetica")
         .fontSize(18)
         .text("By Gbolahan Oyegoke", 54, 580);

      // Footer
      doc.fillColor(TEXT_MUTED)
         .font("Helvetica")
         .fontSize(9)
         .text("Why You Feel Lost (And Where to Begin) • by Gbolahan Oyegoke", 54, 730);

      doc.fillColor(TEXT_MUTED)
         .font("Helvetica")
         .fontSize(10)
         .text("1", 545, 730);

    } else if (p.type === "part") {
      // 2. Part Title Page Layout
      doc.rect(0, 0, 612, 792).fill(DARK_SLATE);

      // Huge transparent part number in background
      doc.fillColor("#1e293b") // extremely subtle
         .font("Helvetica-Bold")
         .fontSize(220)
         .text(p.number, 54, 180);

      // Muted gold Part Title
      doc.fillColor("#fcd34d")
         .font("Helvetica-Bold")
         .fontSize(13)
         .text(p.partTitle, 54, 250);

      // Huge Main title
      doc.fillColor("#ffffff")
         .font("Helvetica-Bold")
         .fontSize(32)
         .text(p.title, 54, 280, { lineGap: 6 });

      // Subtitle
      doc.fillColor("#cbd5e1")
         .font("Helvetica")
         .fontSize(14)
         .text(p.subtitle, 54, 380, { lineGap: 5, width: 450 });

      // Footer Page Number
      doc.fillColor("#94a3b8")
         .font("Helvetica")
         .fontSize(10)
         .text(String(p.page), 545, 730);

    } else if (p.type === "text") {
      // 3. Regular Book Page Layout
      // Elegant Header Line
      doc.fillColor(TEXT_MUTED)
         .font("Helvetica-Bold")
         .fontSize(8.5)
         .text(`${p.partHeader}    |    ${p.chapterHeader}`, 54, 45);

      doc.rect(54, 60, 504, 0.7).fill("#cbd5e1");

      // Set baseline cursor Y coordinate
      let currentY = 85;

      // Draw Main Page Chapter Title if present
      if (p.title) {
        doc.fillColor(DARK_SLATE)
           .font("Helvetica-Bold")
           .fontSize(22)
           .text(p.title, 54, currentY);
        currentY += 35;
      }

      // Draw Paragraphs (first block)
      if (p.paragraphs && p.paragraphs.length > 0) {
        p.paragraphs.forEach(pText => {
          doc.fillColor(TEXT_DARK)
             .font("Helvetica")
             .fontSize(10.5)
             .text(pText, 54, currentY, { lineGap: 4, width: 504 });
          
          // Compute added height of wrapped text dynamically
          const textHeight = doc.heightOfString(pText, { lineGap: 4, width: 504 });
          currentY += textHeight + 14;
        });
      }

      // Draw Remember This Highlight Box if present
      if (p.rememberThis) {
        currentY += 5;
        const boxHeight = doc.heightOfString(p.rememberThis, { lineGap: 4, width: 440 }) + 30;

        // Draw light background
        doc.rect(54, currentY, 504, boxHeight).fill(BG_LIGHT);

        // Gold highlight vertical bar on the left
        doc.rect(54, currentY, 4, boxHeight).fill(GOLD);

        // Box label
        doc.fillColor(GOLD)
           .font("Helvetica-Bold")
           .fontSize(8)
           .text("REMEMBER THIS", 75, currentY + 12);

        // Box text
        doc.fillColor(DARK_SLATE)
           .font("Helvetica-Bold")
           .fontSize(11)
           .text(p.rememberThis, 75, currentY + 24, { lineGap: 4, width: 440 });

        currentY += boxHeight + 20;
      }

      // Draw Extra Paragraphs if present
      if (p.extraParagraphs && p.extraParagraphs.length > 0) {
        p.extraParagraphs.forEach(pText => {
          // Prevent running off bottom of page
          if (currentY + 40 > 710) {
            // Out of space, add page dynamically if needed, but since we align pages precisely,
            // we should scale size or wrap tightly. Standard Letter allows ~680pt of text.
            // Let's condense if we are running close to the margin.
            currentY = Math.min(currentY, 680);
          }
          doc.fillColor(TEXT_DARK)
             .font("Helvetica")
             .fontSize(10.5)
             .text(pText, 54, currentY, { lineGap: 4, width: 504 });

          const textHeight = doc.heightOfString(pText, { lineGap: 4, width: 504 });
          currentY += textHeight + 12;
        });
      }

      // Draw Sections if present (e.g. sub-chapters)
      if (p.sections && p.sections.length > 0) {
        p.sections.forEach(sec => {
          currentY += 10;
          doc.fillColor(DARK_SLATE)
             .font("Helvetica-Bold")
             .fontSize(14)
             .text(sec.title, 54, currentY);
          currentY += 22;

          sec.paragraphs.forEach(pText => {
            doc.fillColor(TEXT_DARK)
               .font("Helvetica")
               .fontSize(10.5)
               .text(pText, 54, currentY, { lineGap: 4, width: 504 });
            
            const textHeight = doc.heightOfString(pText, { lineGap: 4, width: 504 });
            currentY += textHeight + 12;
          });
        });
      }

      // Draw Pause & Reflect Box
      if (p.pauseReflect) {
        currentY += 10;
        const boxHeight = 150;

        doc.roundedRect(54, currentY, 504, boxHeight, 6)
           .fill("#f0f4f8"); // Light blue-gray box

        doc.fillColor("#0f172a")
           .font("Helvetica-Bold")
           .fontSize(8.5)
           .text("PAUSE & REFLECT", 74, currentY + 15);

        let questionY = currentY + 34;
        p.pauseReflect.forEach(qText => {
          doc.fillColor(TEXT_DARK)
             .font("Helvetica-Bold")
             .fontSize(10)
             .text(qText, 74, questionY, { width: 460 });
          questionY += 22;
        });

        currentY += boxHeight + 15;
      }

      // Draw text after Pause & Reflect
      if (p.afterReflectText) {
        doc.fillColor(TEXT_DARK)
           .font("Helvetica-Bold")
           .fontSize(10.5)
           .text(p.afterReflectText, 54, currentY, { lineGap: 4, width: 504 });
        currentY += doc.heightOfString(p.afterReflectText, { lineGap: 4, width: 504 }) + 15;
      }

      // Draw Bento Blocks (Part 10 page 34 special layout)
      if (p.bentoBoxes) {
        currentY += 10;
        const boxWidth = 240;
        const boxHeight = 65;

        p.bentoBoxes.forEach((bento, bIdx) => {
          const isLeft = bIdx % 2 === 0;
          const xPos = isLeft ? 54 : 310;
          const yPos = currentY + Math.floor(bIdx / 2) * (boxHeight + 12);

          // Draw Box
          doc.roundedRect(xPos, yPos, boxWidth, boxHeight, 4)
             .fill("#ffffff")
             .strokeColor("#e2e8f0")
             .lineWidth(1)
             .stroke();

          // Title
          const icon = bIdx === 1 ? "❓ " : bIdx === 4 ? "❤️ " : "";
          doc.fillColor(DARK_SLATE)
             .font("Helvetica-Bold")
             .fontSize(10.5)
             .text(`${icon}${bento.title}`, xPos + 12, yPos + 10);

          // Text
          doc.fillColor(TEXT_DARK)
             .font("Helvetica")
             .fontSize(8)
             .text(bento.text, xPos + 12, yPos + 24, { lineGap: 2.5, width: 216 });
        });

        currentY += Math.ceil(p.bentoBoxes.length / 2) * (boxHeight + 12) + 10;
      }

      // Text after Bento Layout
      if (p.afterBentoText) {
        doc.fillColor(TEXT_DARK)
           .font("Helvetica")
           .fontSize(10.5)
           .text(p.afterBentoText, 54, currentY, { lineGap: 4, width: 504 });
        currentY += doc.heightOfString(p.afterBentoText, { lineGap: 4, width: 504 }) + 15;
      }

      // Draw First Seven Days Blocks (Part 11 page 37/38)
      if (p.days) {
        p.days.forEach(dayItem => {
          // Dynamic space check
          if (currentY + 70 > 710) {
            currentY = Math.min(currentY, 630);
          }
          const blockHeight = doc.heightOfString(dayItem.text, { lineGap: 3, width: 420 }) + 25;

          // Box
          doc.roundedRect(54, currentY, 504, Math.max(70, blockHeight), 6)
             .fill("#ffffff")
             .strokeColor("#cbd5e1")
             .lineWidth(0.8)
             .stroke();

          // Day Badge
          doc.roundedRect(66, currentY + 12, 40, 46, 4)
             .fill(DARK_SLATE);

          doc.fillColor("#94a3b8")
             .font("Helvetica-Bold")
             .fontSize(7)
             .text("DAY", 76, currentY + 18);

          doc.fillColor("#ffffff")
             .font("Helvetica-Bold")
             .fontSize(16)
             .text(dayItem.day, 76, currentY + 28, { align: "center", width: 20 });

          // Day Text Content
          doc.fillColor(DARK_SLATE)
             .font("Helvetica-Bold")
             .fontSize(11)
             .text(dayItem.title, 120, currentY + 14);

          doc.fillColor(TEXT_DARK)
             .font("Helvetica")
             .fontSize(9)
             .text(dayItem.text, 120, currentY + 28, { lineGap: 3, width: 420 });

          currentY += Math.max(70, blockHeight) + 12;
        });
      }

      // Text after Days layout
      if (p.afterDaysText) {
        doc.fillColor(TEXT_DARK)
           .font("Helvetica")
           .fontSize(10.5)
           .text(p.afterDaysText, 54, currentY, { lineGap: 4, width: 504 });
        currentY += doc.heightOfString(p.afterDaysText, { lineGap: 4, width: 504 }) + 15;
      }

      // Page numbers at bottom
      doc.fillColor(TEXT_MUTED)
         .font("Helvetica")
         .fontSize(9.5)
         .text("Why You Feel Lost (And Where to Begin)  •  by Gbolahan Oyegoke", 54, 735);

      doc.fillColor(TEXT_MUTED)
         .font("Helvetica")
         .fontSize(10)
         .text(String(p.page), 545, 735);
    }
  });

  doc.end();

  stream.on("finish", () => {
    console.log("PDF generation complete!");

    // Also copy to dist folder so it's instantly available in the compiled app bundle
    const distPath = path.join(process.cwd(), "dist", "ebook.pdf");
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.copyFileSync(targetPath, distPath);
    console.log(`Copied compiled PDF to build output: ${distPath}`);
  });
}

createEbookPDF();
