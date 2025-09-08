type FormatOptions = 'mix' | 'date' | 'date:time';

export function useFormatDate(
  dateString: string,
  format: FormatOptions
): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  switch (format) {
    case 'mix':
      return date.toLocaleString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });

    case 'date':
      return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });

    case 'date:time':
      return date.toLocaleString('fa-IR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });

    default:
      return '';
  }
}
