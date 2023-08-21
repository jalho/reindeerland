#include <utility>
#include <string>

/**
 * Replace each occurrence of `placeholder` in `input` with `value`.
 *
 * @returns a new, substituted string and its length
 */
std::pair<std::string, int> subst_get_len(const std::string &input, const std::string &placeholder, const std::string &value);
