import satori from "satori";
import sharp from "sharp";
import { BUSINESS, SITE } from "@/data/client";
import { getBrandAssets, OG_WIDTH, OG_HEIGHT, type OgCard } from "./seo";

type ElementStyle = Record<string, string | number>;
type CardElement = {
  type: "div" | "img";
  key: string | null;
  props: {
    style?: ElementStyle;
    children?: string | CardElement[];
    src?: string;
    width?: number;
    height?: number;
  };
};

function box(
  style: ElementStyle,
  children: string | CardElement[] = [],
): CardElement {
  return {
    type: "div",
    key: null,
    props: { style: { display: "flex", boxSizing: "border-box", ...style }, children },
  };
}

function image(
  src: string,
  width: number,
  height: number,
  style: ElementStyle = {},
): CardElement {
  return { type: "img", key: null, props: { src, width, height, style } };
}

export async function renderOgImage(card: OgCard): Promise<Buffer> {
  const assets = await getBrandAssets();
  const photo = await sharp(card.photoBytes)
    .rotate()
    .resize(510, 546, { fit: "cover", position: "centre" })
    .jpeg({ quality: 90 })
    .toBuffer();
  const logo = await sharp(assets.logo)
    .resize(54, 54, { fit: "contain", background: "#f9f3e8" })
    .png()
    .toBuffer();
  const longestLine = Math.max(
    ...card.headline.split("\n").map((line) => line.length),
  );
  const fontSize = longestLine > 18 ? 60 : longestLine > 15 ? 64 : 76;
  const navy = "#00284f";
  const yellow = "#ffcc01";
  const cream = "#f9f3e8";

  const cardTree: CardElement = box(
    {
      position: "relative",
      width: OG_WIDTH,
      height: OG_HEIGHT,
      background: navy,
      color: cream,
      fontFamily: "Roboto",
      overflow: "hidden",
    },
    [
      image(`data:image/jpeg;base64,${photo.toString("base64")}`, 510, 546, {
        position: "absolute",
        right: 0,
        top: 0,
      }),
      box({
        position: "absolute",
        left: 682,
        top: 0,
        width: 8,
        height: 546,
        background: yellow,
      }),
      box(
        {
          position: "absolute",
          top: 0,
          left: 0,
          width: 682,
          height: 546,
          padding: "40px 50px 36px 50px",
          flexDirection: "column",
        },
        [
          box({ alignItems: "center", height: 70, flexShrink: 0 }, [
            box(
              {
                width: 70,
                height: 70,
                borderRadius: 35,
                alignItems: "center",
                justifyContent: "center",
                background: cream,
              },
              [
                image(
                  `data:image/png;base64,${logo.toString("base64")}`,
                  54,
                  54,
                ),
              ],
            ),
            box({ flexDirection: "column", marginLeft: 18 }, [
              box(
                { fontSize: 29, fontWeight: 900, letterSpacing: -0.7 },
                "ROD'S ELECTRICAL",
              ),
              box(
                {
                  fontSize: 14,
                  letterSpacing: 2.8,
                  marginTop: 7,
                  color: yellow,
                  fontWeight: 700,
                },
                "EDMONTON, ALBERTA",
              ),
            ]),
          ]),
          box(
            {
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 2.1,
              textTransform: "uppercase",
              color: yellow,
              marginTop: 50,
            },
            card.label,
          ),
          box(
            {
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
              paddingTop: 18,
              paddingBottom: 12,
            },
            [
              box(
                {
                  fontSize,
                  fontWeight: 900,
                  lineHeight: 1.02,
                  letterSpacing: -2.4,
                  whiteSpace: "pre-wrap",
                  width: 582,
                },
                card.headline,
              ),
              box(
                {
                  marginTop: 23,
                  fontSize: 24,
                  lineHeight: 1.35,
                  color: "#e1e7eb",
                  maxWidth: 558,
                },
                card.detail,
              ),
            ],
          ),
        ],
      ),
      box(
        {
          position: "absolute",
          left: 0,
          bottom: 0,
          width: OG_WIDTH,
          height: 84,
          background: cream,
          color: navy,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 50px",
          borderTop: `6px solid ${yellow}`,
        },
        [
          box({ alignItems: "center" }, [
            box({ width: 30, height: 6, background: yellow, marginRight: 18 }),
            box(
              { fontSize: 25, fontWeight: 700, letterSpacing: -0.3 },
              new URL(SITE.url).hostname,
            ),
          ]),
          box(
            { fontSize: 21, fontWeight: 700 },
            `${BUSINESS.address.city} + area`,
          ),
        ],
      ),
    ],
  );

  const svg = await satori(cardTree, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      { name: "Roboto", data: assets.regular, weight: 400, style: "normal" },
      { name: "Roboto", data: assets.bold, weight: 700, style: "normal" },
      { name: "Roboto", data: assets.black, weight: 900, style: "normal" },
    ],
  });
  return sharp(Buffer.from(svg)).png().toBuffer();
}
