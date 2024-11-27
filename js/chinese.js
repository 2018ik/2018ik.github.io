const sentences = [
    ["奉献的根据是神的买。", "Regeneration, like redemption and justification, is an aspect of God's complete salvation."],
    ["社会地位重生，就如救赎和称义，是神完全救恩的一面。", "Regeneration, like redemption and justification, is an aspect of God's complete salvation."],
    ["然而，众地方召会不是目标，乃是神达到祂经纶之目标所采取的手续。", "However, the local churches are not the goal; rather, they are the procedure that God uses to reach the goal of His economy."],
    ["一件东西从原来的地位，原来的用途，分别出来，摆在神的祭坛上专为着神，这一件东西就是祭。", "An item that from its original position and purpose is separated and placed on God's altar exclusively for Him, this item becomes a sacrifice."],
    ["经济地位", "Economic status"],
    ["社会地位", "Social status"],
    ["更新奉献！愿向你绝对，惜取年岁，紧紧跟随！", "Renew my consecration! I desire to be absolutely for You, cherishing the years, closely following!"],
    ["说到奉献这个经历，无论怎样讲，总不外乎五个大点，就是：奉献的根据，奉献的动机，奉献的意义，奉献的目的，和奉献的结果。", "When it comes to the experience of consecration, no matter how it is discussed, it always revolves around five main points: the basis of consecration, the motive of consecration, the meaning of consecration, the purpose of consecration, and the result of consecration."],
    ["奉献的根据是神的买。", "The basis of consecration is God's redemption."],
    ["你越在祷告中接触主，你就越对许多不信的人有负担。", "The more you contact the Lord in prayer, the more burden you will have for the many unbelievers."],
    ["工作负担", "Workload"],
    ["家庭负担", "Family burden"],
    ["福音书房", "Gospel bookroom e.g. Taiwan Gospel Bookroom (台湾福音书房)."],
    ["约翰福音", "The Gospel of John"],
    ["我们去传福音", "We are going to preach the gospel"],
    ["大体上四福音书是告诉我们基督详细的历史。", "In general, the four gospels tell us the detailed history of Christ."],
    ["所以我们和主之间的爱情，必须常常更新。", "Therefore, the love between us and God must be continually renewed."],
    ["经过过程的三一神", "Processed Triune God"],
    ["变化的过程", "Process of transformation"],
    ["你知道在你一生的过程中，你实际上是逐渐在死么？", "Did you know that throughout the course of your life, you are actually gradually dying?"],
    ["和合本和恢复本是中文圣经的翻译版本。", "The Chinese Union Version and Recovery Version are Chinese translations of the Bible."],
    ["马可福音主要的是记载主在加利利的职事。", "The Gospel of Mark is mainly a record of the Lord’s ministry in Galilee."],
    ["马可福音不像约翰福音那样深奥，也不像马太福音包含那么多的教训。", "The Gospel of Mark is not as profound as the Gospel of John, and it does not contain as many teachings as are found in the Gospel of Matthew."],
    ["基督原来是神的独生子来成为人。", "Christ was originally God's only-begotten Son who became a man."],
    ["相调的目的是要将我们众人引进基督身体的实际。", "The purpose of blending is to allow us all to enter into the reality of the Body of Christ."],
    ["经过过程的三一神乃是涌流的神。祂的三一是为着涌流。父是爱，乃是源；子是恩，乃是泉；灵是交通，乃是涌流的川。", "The processed Triune God is a flowing God. His Trinity is for flowing. The Father as love is the fountain, the Son as grace is the spring, and the Spirit as the fellowship is the flowing river."],
    ["你对基督作生命的经历是什么？", "What is your experience of Christ as life?"],
    ["为了时期满足时的经纶……（弗一10）", "Unto the economy of the fullness of the times"],
    ["基督的救赎是称义的基础。", "The redemption of Christ is the foundation of justification."],
    ["路加福音生命读经", "The Life Study of Luke"],
    ["马可福音生命读经", "The Life Study of Mark"],
    ["马太福音生命读经", "Life Study of Matthew"],
    ["我是真葡萄树，我辐射栽培的人。（约十五1）", "I am the true vine, and My Father is the husbandman."],
    ["启示录", "The Book of Revelation"],
    ["罗马七章启示，争战在我们里面猛烈进行。", "Romans chapter 7 reveals that there is a fierce war going on inside of us."],
    ["且要在那些蒙怜悯，早预备的荣耀的器皿上，彰显祂荣耀的丰富；（罗九23）", "In order that He might make known the riches of His glory upon vessels of mercy, which He had before prepared unto glory, (Rom. 9:23)"],
    ["神经纶终极的目标—神成为人，为要使人在生命和性情上（但不在神格上）成为神，好建造基督的身体，终极完成新耶路撒冷。", "The ultimate goal of God's economy - God became man so that man might become God in life and nature (but not in the Godhead) to build up the Body of Christ to consummate the New Jerusalem."],
    ["全部生命读经共有1,984篇，编为80册，由 水流职事站出版。", "The entire Life Study series consists of 1,984 messages, compiled into 80 volumes, and published by Living Stream Ministry."],
    ["水流职事站，连同台湾福音书房是“地方召会”的官方出版社与李常受作品的独家出版者。", "Living Stream Ministry, together with the Taiwan Gospel Bookroom, is the official publisher of the 'local churches' and the exclusive publisher of the works of Witness Lee."],
    ["感恩节国际相调特会", "International Thanksgiving Blending Conference"],
    ["约翰福音主要的是记载主在犹太地的行动，以及祂在那里所说深奥的话。", "The Gospel of John mainly records the Lord's move in Judea and the profound words He spoke there."],
    ["哥林多信徒因着他们哲学的属世智慧，就有了不同的心思和意见。", "The Corinthian believers, because of their worldly wisdom in philosophy, developed different thoughts and opinions."],
    ["那时，耶路撒冷和犹太全地，并约旦河四周全境的人，都络绎地出去到约翰那里，（太三5）", "At that time Jerusalem and all Judea and all the surrounding region of the Jordan went out to him."],
    ["耶稣受了浸，随即从睡了上来……（太三16）", "And having been baptized, Jesus went up immediately from the water"],
    ["约翰福音生命读经", "The Life Study of John"],
    ["你们比认识真理，真理必叫你们得以自由。（约八32）", "And you shall know the truth, and the truth shall set you free."],
    ["马可福音主要的是记载主在加利利的职事。", "The Gospel of Mark is mainly a record of the Lord’s ministry in Galilee."],
    ["简单的说，基督身体的实际，就是神所救赎的一班人，和神人基督一同过神人的生活。", "Simply put, the reality of the Body of Christ is God's redeemed people and the God-man Jesus living a corporate God-man life."],
    ["变化的目的，就是叫人成为神，直到把人模成祂的形像，和祂完全一样。", "The purpose of transformation is to make man God until man is conformed to the image of God and is exactly like God."],
    ["我们今天在主的恢复里要向所有的人见证，基督的丰富真是追测不尽，为着我们的享受，他实在是包罗万有。", "Today, in the Lord's recovery, we must testify to everyone that the riches of Christ are truly unsearchable and that He is indeed all-inclusive for our enjoyment."],
    ["实行新路以建造基督生机的身体", "Practicing the new way to build up the organic Body of Christ."]
    ["可是这些说到羔羊是配的诗歌，大都是因着基督的救赎赞美羔羊是配。", "However these hymns which speak about the lamb's worthiness, most praise Christ for being worthy because of His redemption."],
    ["说羔羊因救赎了我们，买了我们，所以是配，是完全合乎圣经的。", "To say that the lamb redeemed us, purchased us, and is thus worthy is completely scriptural."],
    ["这七眼也就是在神宝座前点着的七盏火灯", "These seven eyes are also the seven lamps burning before the throne of God."],
    ["这恩典赐给了我这比众圣徒中最小者还小的，叫我将基督那追测不尽的丰富，当作福音传给外邦人。（弗三8）", "To me, less than the least of all saints, was this grace given to announce to the Gentiles the unsearchable riches of Christ as the gospel."],
    ["神命定之路的生活乃是神人生活。", "The living of the God-ordained way is the God-man living."],
    ["今天主的恢复， 就是恢复这些关于神永远的经纶行动中，有关神的灵紧要的点。", "The Lord's recovery today is the recovery of these crucial points concerning God's Spirit in the move of God's eternal economy."],
    ["在新约中有四处主要的经文，两处在福音书，两处在书信，启示活基督这件事。", "In the New Testament there are four verses which reveal the matter of living Christ, two in the Gospels and two in the Epistles."],
    ["活的父怎样差我来，我又因父活着，照样，那吃我的人，也要因我活着。（约六57）", ""],
    ["这是新约头一处直接摸着活基督这件事的经文。", "This is the first verse in the New Testament that directly touches on the matter of the living Christ.s"],
    ["我们是从神一类，因为我们是照着神被造的，有神的形像和样式。", "We are according to God's kind because we were made according to God, having God's image and God's likeness."],
    ["神的形像是指神圣的属性。", "God's image refers to the divine attributes."],
    ["神是纯良的，我们被造也是纯良的，虽然今天我们已经堕落了。", "God is pure, and we were made pure, even though today we are fallen."],
    ["神是在光中，我们也渴慕在光中，不喜欢在黑暗里。", "God is in the light, and we desire to be in the light; we do not like to be in darkness."],
    ["我们所有的属性和神的属性是一样的，性质却不相同。", "Our attributes and God's attributes are the same, but the nature is different."],
    ["保罗在一章十八和十九节中祷告，愿我们知道神的呼召有何等盼望；祂在圣徒中之基业的荣耀，有何等丰富；以及祂的能力向着我们这信的人，是何等超越的浩大。", "In Ephesians chapter 1 verses 18 to 19 Paul prayed that we would know what is the hope of God’s calling, what are the riches of the glory of God’s inheritance in the saints, and what is the surpassing greatness of God’s power toward us who believe.."],
    ["神能照着运行在我们里面的大能，极其充盈的成就一切，超过我们所求所想的。", "God, according to the operation of the power within us, is able to superabundantly accomplish all things, beyond what we can ask or think."],
    ["我们的灵必须敞开，我们的良心必须清洁，我们的心必须纯洁，我们的心思必须清明，我们的情感必须有爱，我们的意志必须服从。", "Our spirit must be opened, our conscience must be clean, our heart must be purified, our mind must be sober, our emotion must be loving, and our will must be submissive."],
    ["弟兄姊妹常说他们“下沉”；但是我们不“下沉”，我们是在诸天界里，远超过一切。", "Brothers and sisters often say they are down, but we are not down; we are in the heavenlies far above all."],
    ["天主教、更正教各宗派、弟兄会、灵恩派、和所有的自由团体，都因着他们不完全且不合乎圣经的神学而受阻，看不见神中心的启示", "The Catholic Church, the Protestant denominations, the Brethren assemblies, the Pentecostal churches, and all the free groups are held back by their imperfect and unscriptural theology from the central revelation of God."],
    ["我不使用“凭基督活着”这句话，因为这句话不能传达正确的思想。", "We don't use the phrase 'live by Christ', because this phrase does not convey the proper thought."],
    ["因为生命之灵的律，在基督耶穌里已经释放了我，使我脱离了罪与死的律。（罗八2）", "For the law of the Spirit of life has freed me in Christ Jesus from the law of sin and of death."],
    ["在这句话里的三个名词，彼此是同位语。", "The three nouns nouns in this sentence are in apposition to one another."],
    ["神生机救恩中加强之工作的秘诀", "The secret of the intensified work of God's salvation."],
    ["基督徒常常说，基督的职事有两个部分或两个段落—祂地上的职事和祂天上的职事。", "Christians often say Christ's ministry has two parts or sections: His earthly ministry and His heavenly ministry."],
    ["我们接近人的方法，必须随机应变。", "Our way to reach people must be flexible."],
    ["只是从前我以为对我是赢得的，这些，我因基督都已经看作亏损。", "What things were gains to me, these I have counted as loss on account of Christ."]
];


document.addEventListener("DOMContentLoaded", function() {
    const postTitle = document.querySelector('h1.post-title');
    const titleText = postTitle.textContent;
    const postContent = document.querySelector('div.post-content');

    sentences.forEach(([chinese, english]) => {
        if (chinese.includes(titleText) && chinese !== titleText) {
            const p = document.createElement('p');
            const boldChinese = chinese.replace(titleText, `<strong>${titleText}</strong>`);
            p.innerHTML = `${boldChinese}<br>${english}`;
            postContent.appendChild(p);
        }
    });
})