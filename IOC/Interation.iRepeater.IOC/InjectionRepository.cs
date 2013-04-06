using Interation.iRepeater.IOC.BindingModules;
using Ninject;

namespace Interation.iRepeater.IOC
{
    public class InjectionRepository
    {
        #region Instance

        private static InjectionRepository _instance;
        private static object _padLock = new object();

        public static InjectionRepository Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_padLock)
                    {
                        if (_instance == null)
                        {
                            _instance = new InjectionRepository();
                        }
                    }
                }

                return _instance;
            }
        }

        #endregion

        readonly IKernel _kernel;

        public IKernel Kernel
        {
            get { return _kernel; }
        }

        private InjectionRepository()
        {
            _kernel = new StandardKernel(new RepositoryBindingModule(), new ServiceBindingModule(), new OtherBindingModule());
        }

        public static T Get<T>()
        {
            return Instance.Kernel.Get<T>();
        }
    }
}
