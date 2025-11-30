import { GoogleGenAI, Type } from "@google/genai";
import { PresentationData } from "../types";
import PptxGenJS from "pptxgenjs";

export const generatePresentationData = async (text: string): Promise<PresentationData> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log("GeminiService - API Key present:", !!apiKey);
  if (!apiKey) {
    throw new Error("API Key is missing. Please set VITE_GEMINI_API_KEY in .env.local.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Structure definition based on "PADRÃO PARA CRIAÇÃO DE APRESENTAÇÕES DE ROTEIRO - CASAL NOTARIAL"
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      cover: {
        type: Type.OBJECT,
        properties: {
          guestName: { type: Type.STRING },
          area: { type: Type.STRING },
          theme: { type: Type.STRING },
          instagram: { type: Type.STRING },
          linkedin: { type: Type.STRING },
          title: { type: Type.STRING },
          duration: { type: Type.STRING, description: "e.g. 60 min" },
          guestDescription: { type: Type.STRING },
          centralGoal: { type: Type.STRING },
        },
        required: [
          "guestName",
          "area",
          "theme",
          "instagram",
          "title",
          "duration",
          "guestDescription",
          "centralGoal",
        ],
      },
      opening: {
        type: Type.OBJECT,
        properties: {
          points: { type: Type.ARRAY, items: { type: Type.STRING } },
          hook: { type: Type.STRING },
          cta: { type: Type.STRING },
        },
        required: ["points", "hook", "cta"],
      },
      // We expect exactly 8 blocks for 1-8
      blocks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            objective: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "LISTA EXAUSTIVA DE TODAS AS PERGUNTAS DO BLOCO. NÃO OMITA NENHUMA. SE HOUVER 15 PERGUNTAS, RETORNE AS 15.",
            },
          },
          required: ["title", "objective", "questions"],
        },
      },
      finalQuestion: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
        },
        required: ["question"],
      },
      closing: {
        type: Type.OBJECT,
        properties: {
          recapPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          ctaPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["recapPoints", "ctaPoints"],
      },
    },
    required: ["cover", "opening", "blocks", "finalQuestion", "closing"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Roteiro Completo:
      ${text.substring(0, 500000)}`,
      config: {
        systemInstruction: `
        ATENÇÃO: VOCÊ É UM EXTRACTOR DE DADOS, NÃO UM RESUMIDOR.
        
        TAREFA: Converter o roteiro fornecido em JSON estruturado para slides.

        REGRA DE OURO (CRÍTICA):
        O usuário reclamou que você está truncando as listas de perguntas.
        - Você DEVE extrair TODAS as perguntas de cada bloco.
        - Se um bloco tem 15 perguntas, o array JSON deve ter 15 strings.
        - NÃO selecione apenas as 3 melhores.
        - NÃO pare de ler o bloco até encontrar o título do próximo.
        - Copie o texto EXATAMENTE como está no roteiro (verbatim).
        - NUNCA, EM HIPÓTESE ALGUMA, retorne "CONTEÚDO DE PERGUNTA AUSENTE". Se não encontrar, deixe a string vazia ou tente inferir do contexto, mas NÃO use placeholders de erro.
        - O texto de entrada pode vir de um DOCX processado, então pode ter formatação estranha. Tente o seu melhor para extrair o conteúdo real.
        
        ESTRUTURA DE SAÍDA ESPERADA:
        1. Capa (Dados do convidado)
        2. Abertura (Pontos, Gancho, CTA)
        3. 8 Blocos de conteúdo (Extraia todas as perguntas de cada seção. Se o roteiro não tiver divisões claras, divida o conteúdo total em 8 partes lógicas)
        4. Pergunta Final (Ponto de Ouro)
        5. Encerramento (Recap e CTAs)

        Verifique contagens: Se você extraiu menos de 5 perguntas em um bloco principal, verifique se não esqueceu conteúdo.
        IMPORTANTE: Se o JSON for inválido, o sistema falhará. Certifique-se de fechar todas as chaves e aspas.
        `,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const output = response.text;
    if (!output) throw new Error("No response from AI");

    // Clean up markdown code blocks if present
    const cleanOutput = output
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let data: PresentationData;
    try {
      data = JSON.parse(cleanOutput) as PresentationData;
    } catch {
      console.error("Failed to parse JSON:", cleanOutput);
      throw new Error("A IA retornou um formato inválido. Tente novamente.");
    }

    // Safety check to ensure we have 8 blocks if the AI returns fewer
    const titles = [
      "DE ONDE TUDO COMEÇOU",
      "PONTOS MARCANTES DA CARREIRA",
      "HISTÓRIAS QUE EMOCIONAM",
      "INOVAÇÃO & DIGITAL",
      "HUMANIZAÇÃO DA GESTÃO",
      "PERGUNTAS POLÊMICAS",
      "PERGUNTAS DO PÚBLICO",
      "VISÃO & LEGADO",
    ];

    while (data.blocks.length < 8) {
      data.blocks.push({
        title: titles[data.blocks.length] || `BLOCO ${data.blocks.length + 1}`,
        objective: "Tópico extraído",
        questions: [],
      });
    }

    // Override titles to ensure they match the template exactly
    data.blocks.forEach((block, index) => {
      if (index < 8) {
        block.title = titles[index];
      }
    });

    // Ensure we limit to 8 blocks max for the template structure
    data.blocks = data.blocks.slice(0, 8);

    return data;
  } catch (error) {
    console.error("Gemini API Error Details:", error);
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    throw error;
  }
};

export const generatePptx = async (data: PresentationData): Promise<Blob> => {
  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Casal Notarial";

  // CORES
  const BLUE = "0066cc";
  const ORANGE = "ff6600";
  const GRAY_LIGHT = "f0f4f8";
  const GRAY_TEXT = "333333";
  const WHITE = "ffffff";

  // SLIDE 1: CAPA
  const s1 = pres.addSlide();
  s1.background = { color: WHITE };

  // Left Blue Side
  s1.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 5, h: 5.625, fill: { color: BLUE } });

  // "Casal Notarial" Text (Replaces the placeholder image)
  // Visually centered in the left 50%
  s1.addText("Casal Notarial", {
    x: 0,
    y: 0,
    w: 5,
    h: 5.625,
    fontSize: 44,
    color: WHITE,
    bold: true,
    align: "center",
    valign: "middle",
  });

  // Right Gray Side
  s1.addShape(pres.ShapeType.rect, { x: 5, y: 0, w: 5, h: 5.625, fill: { color: GRAY_LIGHT } });

  // Content on Right Side
  // 1. Guest Info Block (Top)
  s1.addText(
    [
      { text: `🎙️ Convidada: ${data.cover.guestName}\n`, options: { fontSize: 11, bold: true } },
      { text: `🌎 Área: ${data.cover.area}\n`, options: { fontSize: 11 } },
      { text: `🎯 Tema: ${data.cover.theme}\n`, options: { fontSize: 11 } },
      { text: `📲 Instagram: ${data.cover.instagram}\n`, options: { fontSize: 11 } },
      ...(data.cover.linkedin
        ? [{ text: `💼 LinkedIn: ${data.cover.linkedin}\n`, options: { fontSize: 11 } }]
        : []),
    ],
    { x: 5.2, y: 0.4, w: 4.6, h: 1.6, color: GRAY_TEXT, valign: "top" }
  );

  // 2. Title Block (Middle-Top)
  s1.addText(data.cover.title, {
    x: 5.2,
    y: 2.1,
    w: 4.6,
    h: 0.9,
    fontSize: 18,
    color: BLUE,
    bold: true,
    valign: "top",
  });

  // 3. Duration Block (Middle)
  s1.addText(`DURAÇÃO: ${data.cover.duration}`, {
    x: 5.2,
    y: 3.1,
    w: 4.6,
    h: 0.3,
    fontSize: 10,
    color: GRAY_TEXT,
    bold: true,
    valign: "top",
  });

  // 4. Description Block (Middle-Bottom)
  s1.addText(data.cover.guestDescription, {
    x: 5.2,
    y: 3.5,
    w: 4.6,
    h: 1.4,
    fontSize: 9,
    color: GRAY_TEXT,
    valign: "top",
  });

  // 5. Central Goal Block (Bottom)
  s1.addText(`OLHAR CENTRAL: ${data.cover.centralGoal}`, {
    x: 5.2,
    y: 5.0,
    w: 4.6,
    h: 0.5,
    fontSize: 9,
    color: ORANGE,
    italic: true,
    valign: "bottom",
  });

  // Helper for Header
  const addHeader = (slide: PptxGenJS.Slide, title: string) => {
    slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.85, fill: { color: BLUE } });

    // Logo box (White background)
    slide.addShape(pres.ShapeType.rect, {
      x: 0.3,
      y: 0.1,
      w: 0.65,
      h: 0.65,
      fill: { color: WHITE },
    });

    // "Notar-IA" Text (Replaces logo image)
    slide.addText("Notar-IA", {
      x: 0.3,
      y: 0.1,
      w: 0.65,
      h: 0.65,
      fontSize: 8,
      color: BLUE,
      bold: true,
      align: "center",
      valign: "middle",
    });

    slide.addText(title, {
      x: 1.2,
      y: 0.1,
      w: 8.5,
      h: 0.65,
      fontSize: 24,
      color: WHITE,
      bold: true,
      valign: "middle",
    });
  };

  // SLIDE 2: ABERTURA
  const s2 = pres.addSlide();
  s2.background = { color: WHITE };
  addHeader(s2, "ABERTURA");

  const openRows = data.opening.points.map((p, i) => [
    { text: `${i + 1}. ${p}`, options: { fontSize: 14 } },
  ]);
  s2.addTable(openRows, { x: 0.5, y: 1, w: 9, border: { type: "none" }, color: GRAY_TEXT });

  // Hook with border look
  s2.addShape(pres.ShapeType.rect, { x: 0.5, y: 3.2, w: 9, h: 0.8, fill: { color: "F9FAFB" } }); // Light gray bg
  s2.addShape(pres.ShapeType.rect, { x: 0.5, y: 3.2, w: 0.1, h: 0.8, fill: { color: ORANGE } }); // Left border
  s2.addText(`GANCHO: ${data.opening.hook}`, {
    x: 0.7,
    y: 3.2,
    w: 8.6,
    h: 0.8,
    fontSize: 12,
    color: GRAY_TEXT,
    valign: "middle",
  });

  // CTA
  s2.addShape(pres.ShapeType.rect, { x: 0.5, y: 4.2, w: 9, h: 0.6, fill: { color: BLUE } });
  s2.addText(`CTA: ${data.opening.cta}`, {
    x: 0.5,
    y: 4.2,
    w: 9,
    h: 0.6,
    fontSize: 12,
    color: WHITE,
    bold: true,
    align: "center",
    valign: "middle",
  });

  // SLIDES 3-10: BLOCOS
  data.blocks.forEach((block) => {
    const slide = pres.addSlide();
    slide.background = { color: WHITE };
    addHeader(slide, block.title.toUpperCase());

    slide.addText(`Objetivo: ${block.objective}`, {
      x: 0.5,
      y: 1,
      w: 9,
      fontSize: 12,
      color: GRAY_TEXT,
      italic: true,
    });

    slide.addText("Perguntas", { x: 0.5, y: 1.4, fontSize: 16, color: BLUE, bold: true });
    slide.addShape(pres.ShapeType.line, {
      x: 0.5,
      y: 1.7,
      w: 9,
      h: 0,
      line: { color: ORANGE, width: 2 },
    });

    // Column Logic
    if (block.questions.length > 5) {
      const half = Math.ceil(block.questions.length / 2);
      const col1 = block.questions.slice(0, half);
      const col2 = block.questions.slice(half);

      const createRows = (qs: string[], offset: number) =>
        qs.map((q, i) => [
          { text: `${offset + i + 1}.`, options: { fontSize: 11, color: ORANGE, bold: true } },
          { text: q, options: { fontSize: 11, color: GRAY_TEXT } },
        ]);

      // Col 1
      slide.addTable(createRows(col1, 0), {
        x: 0.5,
        y: 1.9,
        w: 4.2,
        border: { type: "none" },
        colW: [0.3, 3.9],
      });

      // Col 2
      slide.addTable(createRows(col2, half), {
        x: 5.0,
        y: 1.9,
        w: 4.2,
        border: { type: "none" },
        colW: [0.3, 3.9],
      });
    } else {
      const qRows = block.questions.map((q, i) => [
        { text: `${i + 1}.`, options: { fontSize: 11, color: ORANGE, bold: true } },
        { text: q, options: { fontSize: 11, color: GRAY_TEXT } },
      ]);

      slide.addTable(qRows, {
        x: 0.5,
        y: 1.9,
        w: 9,
        border: { type: "none" },
        colW: [0.3, 8.7],
      });
    }
  });

  // SLIDE 11: PERGUNTA FINAL
  const s11 = pres.addSlide();
  s11.background = { color: WHITE };
  addHeader(s11, "PERGUNTA FINAL (PONTO DE OURO)");

  s11.addText("O momento mais esperado:", {
    x: 0,
    y: 1.5,
    w: 10,
    fontSize: 16,
    color: BLUE,
    align: "center",
  });

  // Box with left border
  s11.addShape(pres.ShapeType.rect, { x: 1, y: 2.2, w: 8, h: 1.5, fill: { color: GRAY_LIGHT } });
  s11.addShape(pres.ShapeType.rect, { x: 1, y: 2.2, w: 0.15, h: 1.5, fill: { color: ORANGE } }); // Thicker border simulation

  s11.addText(data.finalQuestion.question, {
    x: 1.3,
    y: 2.2,
    w: 7.5,
    h: 1.5,
    fontSize: 16,
    color: GRAY_TEXT,
    bold: true,
    align: "center",
    valign: "middle",
  });

  s11.addText("⏱️ Duração: 5 minutos", {
    x: 0,
    y: 4.2,
    w: 10,
    fontSize: 14,
    color: GRAY_TEXT,
    align: "center",
  });

  // SLIDE 12: ENCERRAMENTO
  const s12 = pres.addSlide();
  s12.background = { color: WHITE };
  addHeader(s12, "ENCERRAMENTO");

  s12.addText("Agradecimentos e Recap", { x: 0.5, y: 1, fontSize: 16, color: BLUE, bold: true });
  s12.addShape(pres.ShapeType.line, {
    x: 0.5,
    y: 1.4,
    w: 4,
    h: 0,
    line: { color: ORANGE, width: 2 },
  });

  const recapRows = data.closing.recapPoints.map((p) => [
    { text: `🎙️ ${p}`, options: { fontSize: 12 } },
  ]);
  s12.addTable(recapRows, { x: 0.5, y: 1.6, w: 9, border: { type: "none" }, color: GRAY_TEXT });

  s12.addText("CTAs", { x: 0.5, y: 3.5, fontSize: 16, color: BLUE, bold: true });
  s12.addShape(pres.ShapeType.line, {
    x: 0.5,
    y: 3.9,
    w: 4,
    h: 0,
    line: { color: ORANGE, width: 2 },
  });

  // CTA Box
  s12.addShape(pres.ShapeType.rect, { x: 0.5, y: 4.1, w: 9, h: 1.2, fill: { color: GRAY_LIGHT } });
  const ctaRows = data.closing.ctaPoints.map((p) => [
    { text: `📲 ${p}`, options: { fontSize: 12 } },
  ]);
  s12.addTable(ctaRows, { x: 0.6, y: 4.1, w: 8.8, border: { type: "none" }, color: GRAY_TEXT });

  const base64 = (await pres.write({ outputType: "base64" })) as string;
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });
};
