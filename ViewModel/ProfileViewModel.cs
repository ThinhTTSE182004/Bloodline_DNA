using Login.Models;

namespace Login.ViewModel
{
    public class ProfileViewModel
    {
        public User User { get; set; }
        public List<Order> Orders { get; set; }
    }
}
