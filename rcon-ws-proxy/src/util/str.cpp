#include "str.hpp"

std::pair<std::string, int> subst_get_len(const std::string &input, const std::string &placeholder, const std::string &value)
{
    // Create a copy of the input string
    std::string substituted_string = input;

    // Find and replace all occurrences of the placeholder with the value
    size_t pos = 0;
    while ((pos = substituted_string.find(placeholder, pos)) != std::string::npos)
    {
        substituted_string.replace(pos, placeholder.length(), value);
        pos += value.length();
    }

    // Get the length of the new string
    int length = substituted_string.length();

    // Return the new string and its length as a pair
    return std::make_pair(substituted_string, length);
}
