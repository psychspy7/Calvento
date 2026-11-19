const WHATSAPP_PHONE = '919241619573';

export function getWhatsAppCartUrl(cart, total) {
  if (!cart || cart.length === 0) return `https://wa.me/${WHATSAPP_PHONE}`;
  
  const lines = [
    '✨ *CALVENTO — BESPOKE CART ORDER*',
    '',
    'Hello CALVENTO Concierge,',
    'I would like to place a bespoke order for the following curated selection:',
    ''
  ];

  cart.forEach((item, idx) => {
    const sizeInfo = item.selectedSize ? ` (Size: ${item.selectedSize})` : '';
    const itemSubtotal = (item.price || 0) * (item.qty || 1);
    lines.push(`${idx + 1}. *${item.name}*${sizeInfo}`);
    lines.push(`   • SKU: ${item.sku || 'CV-EDIT'}`);
    lines.push(`   • Quantity: ${item.qty || 1}`);
    lines.push(`   • Unit Price: ₹${(item.price || 0).toLocaleString('en-IN')}`);
    lines.push(`   • Item Total: ₹${itemSubtotal.toLocaleString('en-IN')}`);
    lines.push('');
  });

  lines.push(`💎 *Estimated Total:* ₹${(total || 0).toLocaleString('en-IN')}`);
  lines.push('');
  lines.push('📌 *Made-To-Order Policy:* I understand that CALVENTO pieces are handcrafted and tailored over time with meticulous attention to detail. Please confirm my order, tailoring schedule, and payment details.');

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function getWhatsAppProductUrl(product, selectedSize) {
  if (!product) return `https://wa.me/${WHATSAPP_PHONE}`;

  const sizeInfo = selectedSize ? selectedSize : (product.sizes?.length ? 'To be specified' : 'One size');
  const lines = [
    '✨ *CALVENTO — BESPOKE PIECE INQUIRY*',
    '',
    'Hello CALVENTO Concierge,',
    `I would like to inquire about ordering the *${product.name}*.`,
    '',
    `• *SKU:* ${product.sku || 'CV-EDIT'}`,
    `• *Category:* ${product.category || 'Apparel'}`,
    `• *Price:* ₹${(product.price || 0).toLocaleString('en-IN')}`,
    `• *Selected Size:* ${sizeInfo}`,
    '',
    '📌 *Made-To-Order Policy:* I understand that CALVENTO crafts premium pieces with dedicated tailoring time. Please advise on tailoring lead time, availability, and ordering steps.'
  ];

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
}
