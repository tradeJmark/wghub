use js_sys::Array;
use web_sys::Blob;

pub fn set_panic_hook() {
  // When the `console_error_panic_hook` feature is enabled, we can call the
  // `set_panic_hook` function at least once during initialization, and then
  // we will get better error messages if our code ever panics.
  //
  // For more details see
  // https://github.com/rustwasm/console_error_panic_hook#readme
  #[cfg(feature = "console_error_panic_hook")]
  console_error_panic_hook::set_once();
}

pub trait AllInto<R> {
  fn all_into(self) -> Vec<R>;
}

impl<C, R> AllInto<R> for C where
  C: IntoIterator,
  C::Item: Into<R>
{
  fn all_into(self) -> Vec<R> {
    self.into_iter().map(|t| t.into()).collect()
  }
}

pub trait Blobbable {
  fn blobbify(self) -> Blob;
}

impl Blobbable for String {
  fn blobbify(self) -> Blob {
    let array = Array::of1(&self.into());
    Blob::new_with_str_sequence(&array).unwrap()
  }
}