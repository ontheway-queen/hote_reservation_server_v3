export const journalFormatter = (data: any[]) => {
  const transformedData = data.reduce((acc: Voucher[], entry: any) => {
    let existingVoucher = acc.find((v) => v.voucher_no === entry.voucher_no);

    if (!existingVoucher) {
      existingVoucher = {
        org_id: entry.org_id,
        voucher_no: entry.voucher_no,
        payment_method: entry.payment_method,
        payment_type: entry.payment_type,
        cheque_no: entry.cheque_no,
        cheque_date: entry.cheque_date,
        bank_name: entry.bank_name,
        voucher_date: entry.voucher_date,
        created_at: entry.created_at,
        user_full_name: entry.user_full_name,
        entries: { debit: [], credit: [] },
      };
      acc.push(existingVoucher);
    }

    // Separate into debit and credit entries based on amounts
    const entryType = parseFloat(entry.debit) > 0 ? 'debit' : 'credit';
    existingVoucher.entries[entryType].push({
      serial_no: entry.serial_no,
      head_group_code: entry.head_group_code,
      head_code: entry.head_code,
      head_name: entry.head_name,
      debit: entry.debit,
      credit: entry.credit,
      description: entry.description,
    });

    return acc;
  }, []);

  return transformedData;
};

interface Entry {
  serial_no: number;
  head_group_code: string;
  head_code: string;
  head_name: string;
  debit: string;
  credit: string;
  description: string;
}

interface Voucher {
  org_id: number;
  voucher_no: string;
  payment_method: string | null;
  payment_type: string;
  cheque_no: string | null;
  cheque_date: string | null;
  bank_name: string | null;
  voucher_date: string;
  created_at: string;
  user_full_name: string;
  entries: {
    debit: Entry[];
    credit: Entry[];
  };
}
