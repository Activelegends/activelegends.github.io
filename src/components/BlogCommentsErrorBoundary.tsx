import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/** در صورت خطا در رندر نظرات بلاگ، فقط این بخش خراب می‌شود نه کل صفحه */
export class BlogCommentsErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('BlogComments error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <section className="mt-10 pt-6 border-t border-white/10">
            <h2 className="text-lg font-bold text-white mb-4">نظرات</h2>
            <p className="text-gray-400 text-sm">
              خطا در بارگذاری نظرات. صفحه را رفرش کنید یا بعداً تلاش کنید.
            </p>
          </section>
        )
      );
    }
    return this.props.children;
  }
}
