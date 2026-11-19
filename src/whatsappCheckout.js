/**
 * CALVENTO WHATSAPP CONCIERGE ORDERING & INQUIRY ENGINE
 * Concierge Direct Line: +91 92416 19573 (919241619573)
 */

export const WHATSAPP_PHONE = '919241619573';
export const WHATSAPP_DISPLAY_PHONE = '+91 92416 19573';

/**
 * Generate a bespoke WhatsApp order checkout URL with itemized luxury breakdown
 * @param {Array} cart - Cart items
 * @param {number} total - Subtotal in INR
 * @param {Object} options - Additional checkout options (e.g. giftBox, notes)
 * @returns {string} wa.me URL with encoded message
 */
export function getWhatsAppCartUrl(cart, total, options = {}) {
  if (!cart || cart.length === 0) {
    return `https://wa.me/${WHATSAPP_PHONE}`;
  }

  const lines = [
    '👑 *CALVENTO — PRIVATE BESPOKE ORDER COMMISSION*',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    'Dear CALVENTO Concierge,',
    'I wish to commission the following tailored wardrobe selection:',
    ''
  ];

  cart.forEach((item, idx) => {
    const sizeInfo = item.selectedSize ? ` (Size: ${item.selectedSize})` : '';
    const unitPrice = item.price || 0;
    const quantity = item.qty || 1;
    const lineSubtotal = unitPrice * quantity;

    lines.push(`*Look ${idx + 1}: ${item.name}*${sizeInfo}`);
    lines.push(`   • SKU: ${item.sku || 'CV-BESPOKE'}`);
    lines.push(`   • Quantity: ${quantity}`);
    lines.push(`   • Unit Price: ₹${unitPrice.toLocaleString('en-IN')}`);
    lines.push(`   • Line Total: ₹${lineSubtotal.toLocaleString('en-IN')}`);
    lines.push('');
  });

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(`💎 *ESTIMATED TOTAL:* ₹${(total || 0).toLocaleString('en-IN')}`);
  
  if (options.includeGiftBox) {
    lines.push('🎁 *PACKAGING:* Complimentary CALVENTO Signature Linen Gift Box');
  }

  if (options.notes) {
    lines.push(`📝 *BESPOKE REQUESTS:* ${options.notes}`);
  }

  lines.push('');
  lines.push('⚜️ *MADE-TO-ORDER CRAFTSMANSHIP POLICY:*');
  lines.push('I understand each CALVENTO piece is meticulously handcrafted upon order confirmation by master artisans. Please confirm my commission, tailoring schedule, and payment details.');
  lines.push('');
  lines.push('Client reference generated via CALVENTO Digital Storefront.');

  const encodedText = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodedText}`;
}

/**
 * Generate a single-item bespoke WhatsApp inquiry URL
 * @param {Object} product - Product object
 * @param {string} selectedSize - Optional chosen size
 * @returns {string} wa.me URL with encoded inquiry
 */
export function getWhatsAppProductUrl(product, selectedSize) {
  if (!product) {
    return `https://wa.me/${WHATSAPP_PHONE}`;
  }

  const sizeInfo = selectedSize
    ? selectedSize
    : (product.sizes && product.sizes.length ? 'To be tailored / specified' : 'One size');

  const lines = [
    '✨ *CALVENTO — BESPOKE PIECE INQUIRY*',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    'Dear CALVENTO Concierge,',
    `I am inquiring regarding the *${product.name}*.`,
    '',
    `• *SKU:* ${product.sku || 'CV-BESPOKE'}`,
    `• *Category:* ${product.category || 'Haute Wardrobe'}`,
    `• *Price:* ₹${(product.price || 0).toLocaleString('en-IN')}${product.priceUSD ? ` / $${product.priceUSD.toLocaleString('en-US')} USD` : ''}`,
    `• *Requested Size / Format:* ${sizeInfo}`,
    ''
  ];

  if (product.specs && product.specs.length) {
    lines.push('• *Craftsmanship Details:*');
    product.specs.slice(0, 3).forEach(([label, value]) => {
      lines.push(`   - ${label}: ${value}`);
    });
    lines.push('');
  }

  lines.push('⚜️ *MADE-TO-ORDER CRAFTSMANSHIP POLICY:*');
  lines.push('I understand CALVENTO garments are handcrafted with dedicated artisanal time. Please advise on tailoring lead time, bespoke fitting appointments, and reservation steps.');
  lines.push('');
  lines.push('Inquiry placed via CALVENTO Digital Storefront.');

  const encodedText = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodedText}`;
}
