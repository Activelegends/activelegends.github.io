import { useEffect, useState } from 'react';
import AdminQuickNav from '../../components/AdminQuickNav';
import { yektanetService, type YektanetPlacement, type YektanetPosition } from '../../services/yektanetService';

type PlacementConfig = {
  key: string;
  label: string;
  position: YektanetPosition;
  format: 'image' | 'text' | 'html';
  supportsParagraphOptions?: boolean;
};

const PLACEMENTS_CONFIG: PlacementConfig[] = [
  { key: 'post_start_image', label: 'شروع پست - بنری/تصویری', position: 'post_start', format: 'image' },
  { key: 'post_start_text', label: 'شروع پست - متنی', position: 'post_start', format: 'text' },
  { key: 'post_end_image', label: 'انتهای پست - بنری/تصویری', position: 'post_end', format: 'image' },
  { key: 'post_end_text', label: 'انتهای پست - متنی', position: 'post_end', format: 'text' },
  { key: 'sidebar_image', label: 'سایدبار - بنری/تصویری', position: 'sidebar', format: 'image' },
  { key: 'sidebar_text', label: 'سایدبار - متنی', position: 'sidebar', format: 'text' },
  {
    key: 'post_middle_repeat_image',
    label: 'وسط پست - تکرار تصویر',
    position: 'post_middle',
    format: 'image',
    supportsParagraphOptions: true,
  },
  {
    key: 'post_middle_text',
    label: 'وسط پست - متنی',
    position: 'post_middle',
    format: 'text',
    supportsParagraphOptions: true,
  },
  { key: 'fixed_bottom', label: 'نوار ثابت پایین صفحه', position: 'fixed_bottom', format: 'html' },
  { key: 'full_page', label: 'تبلیغ تمام‌صفحه (اینترستیشیال)', position: 'full_page', format: 'html' },
];

type EditablePlacement = YektanetPlacement & { dirty?: boolean; saving?: boolean };

export default function YektanetAdminPage() {
  const [items, setItems] = useState<EditablePlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const existing = await yektanetService.getAllPlacements();
        const byKey = new Map(existing.map((p) => [p.key, p]));
        const merged: EditablePlacement[] = PLACEMENTS_CONFIG.map((cfg) => {
          const found = byKey.get(cfg.key);
          return {
            id: found?.id,
            key: cfg.key,
            label: found?.label || cfg.label,
            page: (found?.page as 'blog_post') || 'blog_post',
            position: cfg.position,
            format: cfg.format,
            enabled: found?.enabled ?? false,
            html_code: found?.html_code ?? '',
            insert_after_paragraph: found?.insert_after_paragraph ?? null,
            repeat_every_paragraph: found?.repeat_every_paragraph ?? null,
            dirty: false,
          };
        });
        setItems(merged);
      } catch (err: any) {
        console.error('Error loading Yektanet placements', err);
        setError(err.message || 'خطا در بارگذاری تنظیمات یکتانت');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateItem = (key: string, patch: Partial<EditablePlacement>) => {
    setItems((prev) =>
      prev.map((it) => (it.key === key ? { ...it, ...patch, dirty: true } : it)),
    );
  };

  const handleSave = async (item: EditablePlacement) => {
    try {
      setItems((prev) =>
        prev.map((it) => (it.key === item.key ? { ...it, saving: true } : it)),
      );
      const payload: YektanetPlacement = {
        id: item.id,
        key: item.key,
        label: item.label,
        page: 'blog_post',
        position: item.position,
        format: item.format,
        enabled: item.enabled,
        html_code: item.html_code,
        insert_after_paragraph: item.insert_after_paragraph ?? null,
        repeat_every_paragraph: item.repeat_every_paragraph ?? null,
      };
      const saved = await yektanetService.upsertPlacement(payload);
      setItems((prev) =>
        prev.map((it) =>
          it.key === item.key
            ? { ...it, ...saved, dirty: false, saving: false }
            : it,
        ),
      );
    } catch (err: any) {
      console.error('Error saving Yektanet placement', err);
      setError(err.message || 'خطا در ذخیره تنظیمات');
      setItems((prev) =>
        prev.map((it) => (it.key === item.key ? { ...it, saving: false } : it)),
      );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <AdminQuickNav />
        <h1 className="text-2xl md:text-3xl font-extrabold mb-4">مدیریت تبلیغات یکتانت</h1>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-400 text-sm">در حال بارگذاری...</p>
        ) : (
          <div className="space-y-6">
            {items.map((item) => {
              const cfg = PLACEMENTS_CONFIG.find((c) => c.key === item.key);
              return (
                <section
                  key={item.key}
                  className="bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                    <div>
                      <h2 className="text-lg font-bold">{item.label}</h2>
                      <p className="text-xs text-gray-400 mt-1 ltr">
                        کلید: <code className="text-[11px] bg-white/10 px-1.5 py-0.5 rounded">{item.key}</code>
                      </p>
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(e) => updateItem(item.key, { enabled: e.target.checked })}
                      />
                      <span className="text-gray-200">فعال باشد</span>
                    </label>
                  </div>

                  {cfg?.supportsParagraphOptions && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">
                          درج بعد از چند پاراگراف؟
                        </label>
                        <input
                          type="number"
                          min={1}
                          className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-1.5 text-sm"
                          value={item.insert_after_paragraph ?? ''}
                          onChange={(e) =>
                            updateItem(item.key, {
                              insert_after_paragraph: e.target.value
                                ? Number(e.target.value)
                                : null,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">
                          تکرار هر چند پاراگراف یک‌بار؟ (اختیاری)
                        </label>
                        <input
                          type="number"
                          min={1}
                          className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-1.5 text-sm"
                          value={item.repeat_every_paragraph ?? ''}
                          onChange={(e) =>
                            updateItem(item.key, {
                              repeat_every_paragraph: e.target.value
                                ? Number(e.target.value)
                                : null,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  <label className="block text-xs text-gray-300 mb-1">
                    کد کامل یکتانت (HTML/JS). بدون هیچ تغییری همینجا پیست کنید.
                  </label>
                  <textarea
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono ltr min-h-[120px]"
                    value={item.html_code}
                    onChange={(e) => updateItem(item.key, { html_code: e.target.value })}
                    spellCheck={false}
                  />

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-gray-500">
                      کد‌ها بدون هیچ ویرایشی در جایگاه مربوطه قرار می‌گیرند. نام کلاس‌ها و IDهای اضافه‌شده در اطراف،
                      خنثی و بدون کلمه ad/ads/banner هستند.
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSave(item)}
                      disabled={item.saving || !item.dirty}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-black disabled:opacity-40"
                    >
                      {item.saving ? 'در حال ذخیره...' : item.dirty ? 'ذخیره' : 'ذخیره شد'}
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

