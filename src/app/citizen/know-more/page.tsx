'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  HelpCircle,
  Scale,
  ShieldAlert,
  BookOpen,
  Info,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  statutoryCitations?: string[];
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: `Greetings. I am the Know More AI Assistant for Legal Metrology. I can provide educational insights, statutory rules interpretations, and explanations of The Legal Metrology (Packaged Commodities) Rules, 2011.\n\n*Important Statutory Boundary: My responses are strictly informational guidance for consumer awareness and cannot issue legal compliance verdicts or replace the statutory authority of a Legal Metrology Controller.*`,
    timestamp: '19:00',
    statutoryCitations: ['Legal Metrology Act, 2009', 'Packaged Commodities Rules, 2011'],
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'What are the mandatory label declarations required under Rule 6 of the Packaged Commodities Rules?',
    timestamp: '19:01',
  },
  {
    id: 'msg-3',
    sender: 'ai',
    text: `Under Rule 6(1) of The Legal Metrology (Packaged Commodities) Rules, 2011, every pre-packaged commodity must conspicuously declare the following 7 statutory declarations on the principal display panel:\n\n1. **Rule 6(1)(a)**: Name and complete physical postal address of the manufacturer, packer, or importer.\n2. **Rule 6(1)(b)**: Common or generic name of the commodity.\n3. **Rule 6(1)(c)**: Net quantity in terms of standard SI metric units (g, kg, ml, l, m, N). Use of non-standard symbols like "gms" or "ltrs" is strictly prohibited.\n4. **Rule 6(1)(d)**: Month and year of manufacture, pre-packing, or import.\n5. **Rule 6(1)(e)**: Retail sale price as "Maximum Retail Price (MRP) Rs. / ₹ ... (inclusive of all taxes)". Dual pricing stickers are illegal.\n6. **Rule 6(1)(da)**: Unit Sale Price (USP) in terms of ₹ per gram, milliliter, or unit for packages ≥ 1kg/1L.\n7. **Rule 6(1)(f)**: Complete consumer care contact details including telephone number, email, and designated grievance address.\n\nAdditionally, **Rule 6(10)** mandates explicit declaration of Country of Origin for imported goods.`,
    timestamp: '19:01',
    statutoryCitations: ['PCR 2011, Rule 6(1)', 'Legal Metrology Act, Section 36(1)'],
  },
];

const PRESET_QUESTIONS = [
  'Is it legal for a shopkeeper to paste a higher price sticker over the printed MRP?',
  'Why is writing "250 gms" or "1 ltr" a statutory infraction instead of "250 g"?',
  'When is Unit Sale Price (USP) mandatory on grocery items?',
  'What penalties apply under Section 36(1) for deceptive packaging?',
];

export default function CitizenKnowMorePage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      let citations: string[] = ['Legal Metrology Act, 2009'];

      if (query.toLowerCase().includes('higher price') || query.toLowerCase().includes('sticker') || query.toLowerCase().includes('mrp')) {
        reply = `**No, pasting a higher price sticker or charging above the printed MRP is illegal in India.**\n\nUnder Section 36(1) of The Legal Metrology Act, 2009, no person shall manufacture, pack, import, sell, offer, expose or possess for sale any pre-packaged commodity at a price exceeding the Maximum Retail Price (MRP) printed on the package. Pasting handwritten or fresh printed price stickers over original printed prices without official statutory amendment notifications is an offense punishable with compounding fines up to ₹ 25,000 for the first offense and ₹ 50,000 for subsequent offenses.`;
        citations = ['Section 36(1), Legal Metrology Act', 'Rule 18(2), PCR 2011'];
      } else if (query.toLowerCase().includes('gms') || query.toLowerCase().includes('ltr') || query.toLowerCase().includes('unit')) {
        reply = `**The Third Schedule of the Packaged Commodities Rules mandates strict SI metric standard symbols.**\n\nUnder Rule 6(1)(c) read with the Third Schedule, the legal symbols are:\n- Gram: **g** (not gm, gms, or grm)\n- Kilogram: **kg** (not kgs or kilo)\n- Milliliter: **ml** or **mL** (not mltr, mltrs)\n- Liter: **l** or **L** (not ltr or ltrs)\n\nUsing pluralized abbreviations (like "500 gms") is a statutory violation because non-standard abbreviations cause consumer confusion and deviate from national metrological standards.`;
        citations = ['Third Schedule, PCR 2011', 'Rule 6(1)(c)'];
      } else if (query.toLowerCase().includes('usp') || query.toLowerCase().includes('unit sale price')) {
        reply = `**Unit Sale Price (USP) was mandated via the 2021 Amendment to Rule 6(1)(da).**\n\nUSP is mandatory whenever:\n1. A package contains more than 1 kg or 1 liter of commodity (e.g., a 2 kg packet must declare ₹ XX / g or ₹ XX / kg).\n2. A package contains multi-units or items sold by count (e.g. ₹ XX / unit or piece).\n\nThis statutory mandate ensures consumers can make direct price-value comparisons across different package weights and sizes.`;
        citations = ['Rule 6(1)(da) (2021 Amendment)'];
      } else {
        reply = `Under The Legal Metrology (Packaged Commodities) Rules, 2011, pre-packaged goods must provide transparent, unambiguous packaging declarations. Retailers and manufacturers who fail to declare mandatory information or tamper with labels are liable under Section 36. For specific disputes, citizens can file formal complaints through our portal or approach the District Legal Metrology Officer.`;
        citations = ['Legal Metrology Act, 2009'];
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        statutoryCitations: citations,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div>
      <PageHeader
        title="Know More AI — Metrology Knowledge Assistant"
        description="Ask questions regarding statutory metrology rules, mandatory label specifications, packaging standards, and consumer rights under Indian law."
        breadcrumbs={[
          { label: 'Citizen Portal', href: '/citizen' },
          { label: 'Know More AI' },
        ]}
      />

      {/* Mandatory Statutory Separation Notice */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: '6px',
          backgroundColor: '#FEF7EC',
          border: '1px solid #F7DDB6',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
          color: '#B7791F',
        }}
      >
        <ShieldAlert size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Informational System Separation:</strong> Know More AI is an educational assistant. In accordance with
          regulatory platform governance, conversational AI does <em>not</em> evaluate package compliance dossiers or
          substitute for statutory verdicts issued by the deterministic rule engine or authorized metrology officers.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {/* Chat Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '620px' }}>
          {/* Header */}
          <div className="card-header" style={{ padding: '14px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#E7F3F2',
                  color: '#14857D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Know More AI Assistant</h3>
                <span style={{ fontSize: '11px', color: '#6B7A7A' }}>
                  Statute Reference: Legal Metrology (Packaged Commodities) Rules, 2011
                </span>
              </div>
            </div>

            <span className="badge badge-pass" style={{ fontSize: '10px' }}>
              Informational Only
            </span>
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backgroundColor: '#F9FAFA',
            }}
          >
            {messages.map((m) => {
              const isAi = m.sender === 'ai';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isAi ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                    alignSelf: isAi ? 'flex-start' : 'flex-end',
                  }}
                >
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: isAi ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                      backgroundColor: isAi ? '#FFFFFF' : '#14857D',
                      color: isAi ? '#1C2526' : '#FFFFFF',
                      border: isAi ? '1px solid #E4EBEA' : 'none',
                      fontSize: '13px',
                      lineHeight: 1.55,
                      boxShadow: '0 1px 2px rgba(28, 37, 38, 0.04)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {m.text}

                    {m.statutoryCitations && m.statutoryCitations.length > 0 && (
                      <div
                        style={{
                          marginTop: '12px',
                          paddingTop: '8px',
                          borderTop: '1px solid #E4EBEA',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                        }}
                      >
                        <span style={{ fontSize: '10px', fontWeight: 600, color: '#6B7A7A', textTransform: 'uppercase' }}>
                          Statutory References:
                        </span>
                        {m.statutoryCitations.map((cit, cIdx) => (
                          <span
                            key={cIdx}
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              padding: '1px 6px',
                              borderRadius: '3px',
                              backgroundColor: '#E7F3F2',
                              color: '#0F5F59',
                            }}
                          >
                            {cit}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <span style={{ fontSize: '10px', color: '#8E9C9B', marginTop: '4px', padding: '0 4px' }}>
                    {m.timestamp}
                  </span>
                </div>
              );
            })}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7A7A', fontSize: '12px' }}>
                <Sparkles size={14} className="spin" />
                <span>Searching statutory metrology regulations...</span>
              </div>
            )}
          </div>

          {/* Quick preset chips */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid #E4EBEA',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7A7A', whiteSpace: 'nowrap' }}>
              Suggested Inquiries:
            </span>
            {PRESET_QUESTIONS.map((q, qIdx) => (
              <button
                key={qIdx}
                type="button"
                onClick={() => handleSend(q)}
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '4px 10px',
                  borderRadius: '14px',
                  border: '1px solid #E4EBEA',
                  backgroundColor: '#F6F8F8',
                  color: '#1C2526',
                  whiteSpace: 'nowrap',
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid #E4EBEA',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Ask regarding Legal Metrology (e.g., maximum permissible error, font height rules, MRP taxes)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
            >
              <Send size={15} /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

